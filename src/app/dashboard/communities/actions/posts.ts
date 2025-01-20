"use server";

import z from "zod";
import {
    commentSchema,
    communityCreatePostsSchema,
    communityEditPostSchema,
    Post,
    PostComment
} from "@/types/communities/communities";
import { createClient } from "@/utils/supabase/server";
import { getUserCommunityPermissions } from "@/utils/community/roles";
import { hasPermission, Permission } from "@/types/communities/permissions";
import {createAdminClient} from "@/utils/supabase/admin";
import {getUserProfile} from "@/utils/profile";

/**
 * Creates a new post in a community.
 *
 * @param {z.infer<typeof communityCreatePostsSchema>} post - The post data to create.
 * @returns {Promise<Object>} A promise that resolves to an object containing the status and post ID if successful.
 */
export async function createPost(
    post: z.infer<typeof communityCreatePostsSchema>,
) {
    const validatedData = communityCreatePostsSchema.safeParse(post);

    if (!validatedData.success) {
        console.error("Invalid form data:", validatedData.error);
        return {
            status: "error",
            message: "Invalid form data",
        };
    }

    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        console.error("createPost Error:", error);
        return {
            status: "error",
            message: "Unauthorized",
        };
    }

    const { title, content, tags, communityId } = validatedData.data;
    const userPerms = await getUserCommunityPermissions(
        user.id,
        communityId,
    );

    if (!userPerms || !hasPermission(userPerms, Permission.CREATE_POST)) {
        return {
            status: "error",
            message: "You do not have permission to create a post in this community",
        }
    }

    const jsonContent = JSON.parse(content);
    let thumbnail = "";
    for (const block of jsonContent) {
        if (block.type === "image") {
            thumbnail = block.data.file.url;
            break;
        }
    }

    const adminClient = createAdminClient();
    const { data, error: postError } = await adminClient
        .from('community_posts')
        .insert({
            author_id: user.id,
            community_id: communityId,
            title,
            content,
            type: "POST",
            thumbnail,
            tags,
        }).select();

    if (postError || !data) {
        console.error("createPost Error:", postError);
        return {
            status: "error",
            message: "Failed to create post",
        };
    }

    return {
        status: "success",
        id: data[0].id,
    };
}

/**
 * Fetches the latest posts for a community.
 *
 * @param {string} communityId - The ID of the community.
 * @param {number} [limit=10] - The maximum number of posts to fetch.
 * @returns {Promise<Post[]>} A promise that resolves to an array of posts.
 */
export async function getLatestCommunityPosts(communityId: string, limit = 10) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('community_posts')
        .select(`
         *,
         author:profiles!community_posts_author_id_fkey1(name, avatar_url),
         likes:community_likes(count),
         comments:community_comments(count)
        `)
        .eq('community_id', communityId)
        .eq('type', 'POST')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error || !data) {
        console.error("getLatestCommunityPosts Error:", error);
        return [];
    }

    const { data: statusData, error: statusError } = await supabase.rpc('has_user_liked_bookmarked', {
        post_ids: data.map(post => post.id), // Array of post IDs
    });

    if (statusError) {
        console.error('Error fetching liked statuses:', statusError);
        return;
    }

    const processedPosts = data.map(post => {
        const statusInfo = statusData.find(
            (status: { post_id: any }) => status.post_id === post.id
        );
        return {
            ...post,
            userLiked: statusInfo?.user_liked || false,
            userBookmarked: statusInfo?.user_bookmarked || false
        };
    });

    if (error) {
        console.error("getLatestCommunityPosts Error:", error);
        return []
    }

    return processedPosts as Post[];
}

/**
 * Fetches a specific post by its ID within a community.
 *
 * @param {string} communityId - The ID of the community.
 * @param {string} postId - The ID of the post to fetch.
 * @returns {Promise<Post|null>} A promise that resolves to the post object or null if not found.
 */
export async function getPost(communityId: string, postId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('community_posts')
        .select(`
        *,
         author:profiles!community_posts_author_id_fkey1(id, name, avatar_url),
         likes:community_likes(count),
         comments:community_comments(count)`)
        .eq('id', postId)
        .eq('community_id', communityId)
        .single();

    if (error || !data) {
        console.error("getPost Error:", error);
        return null;
    }

    // Get if user liked the post
    const { data: statusData, error: statusError } = await supabase.rpc('has_user_liked_bookmarked', {
        post_ids: [data.id], // Array of post IDs
    });

    if (statusError) {
        console.error('Error fetching liked/bookmarked statuses:', statusError);
        return null;
    }

    return { ...data, userLiked: statusData[0]?.user_liked || false, userBookmarked: statusData[0]?.user_bookmarked || false } as Post;
}

/**
 * Adds a comment to a post.
 *
 * @param {number} postId - The ID of the post to comment on.
 * @param {z.infer<typeof commentSchema>} comment - The comment data to add.
 * @returns {Promise<Object>} A promise that resolves to an object containing the status and comment data if successful.
 */
export async function addPostComment(postId: number, comment: z.infer<typeof commentSchema>) {
    const validatedData = commentSchema.safeParse(comment);

    if (!validatedData.success) {
        console.error("Invalid form data:", validatedData.error);
        return {
            status: "error",
            message: "Invalid form data",
        };
    }

    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        console.error("addPostComment Error:", error);
        return {
            status: "error",
            message: "Unauthorized",
        };
    }

    const { content } = validatedData.data;
    const profile = await getUserProfile(user.id);

    if (!profile) {
        console.error("addPostComment Error: Failed to get user profile");
        return {
            status: "error",
            message: "Failed to add comment",
        };
    }

    const { data, error: commentError } = await supabase
        .from('community_comments')
        .insert({
            post_id: postId,
            author_id: user.id,
            content,
        }).select();

    if (commentError || !data) {
        console.error("addPostComment Error:", commentError);
        return {
            status: "error",
            message: "Failed to add comment",
        };
    }

    return {
        status: "success",
        comment: {
            id: data[0].id,
            content,
            created_at: data[0].created_at,
            author: {
                id: user.id,
                name: profile.name,
                avatar_url: profile.avatar_url,
            }
        } as PostComment,
    };
}

/**
 * Deletes a comment from a post.
 *
 * @param {number} postId - The ID of the post.
 * @param {number} commentId - The ID of the comment to delete.
 * @returns {Promise<Object>} A promise that resolves to an object containing the status.
 */
export async function deletePostComment(postId: number, commentId: number) {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        console.error("deletePostComment Error:", error);
        return {
            status: "error",
            message: "Unauthorized",
        };
    }

    const { data, error: postError } = await supabase
        .from('community_posts')
        .select('community_id')
        .eq('id', postId)
        .single();

    if (postError || !data) {
        console.error("deletePostComment Error:", postError);
        return {
            status: "error",
            message: "Failed to delete comment",
        };
    }

    const userPerms = await getUserCommunityPermissions(user.id, data.community_id);

    if (!userPerms || !hasPermission(userPerms, Permission.DELETE_COMMENT)) {
        return {
            status: "error",
            message: "You do not have permission to delete comments in this community",
        };
    }

    const adminClient = createAdminClient();
    const { error: deleteError } = await adminClient
        .from("community_comments")
        .delete()
        .eq("id", commentId)
        .eq("post_id", postId);

    if (deleteError) {
        console.error("deletePostComment Error:", deleteError);
        return {
            status: "error",
            message: "Failed to delete comment",
        };
    }

    return {
        status: "success",
    };
}

/**
 * Deletes a post.
 *
 * @param {number} postId - The ID of the post to delete.
 * @returns {Promise<Object>} A promise that resolves to an object containing the status.
 */
export async function deletePost(postId: number) {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        console.error("deletePost Error:", error);
        return {
            status: "error",
            message: "Unauthorized",
        };
    }

    const { data, error: postError } = await supabase
        .from('community_posts')
        .select('community_id')
        .eq('id', postId)
        .single();

    if (postError || !data) {
        console.error("deletePost Error:", postError);
        return {
            status: "error",
            message: "Failed to delete post",
        };
    }

    const userPerms = await getUserCommunityPermissions(user.id, data.community_id);

    if (!userPerms || !hasPermission(userPerms, Permission.DELETE_POST)) {
        return {
            status: "error",
            message: "You do not have permission to delete posts in this community",
        };
    }

    const adminClient = createAdminClient();
    const { error: deleteError } = await adminClient
        .from("community_posts")
        .delete()
        .eq("id", postId);

    if (deleteError) {
        console.error("deletePost Error:", deleteError);
        return {
            status: "error",
            message: "Failed to delete post",
        };
    }

    return {
        status: "success",
    };
}

/**
 * Edits an existing post.
 *
 * @param {z.infer<typeof communityEditPostSchema>} post - The post data to edit.
 * @returns {Promise<Object>} A promise that resolves to an object containing the status and post ID if successful.
 */
export async function editPost(
    post: z.infer<typeof communityEditPostSchema>,
) {
    const validatedData = communityEditPostSchema.safeParse(post);

    if (!validatedData.success) {
        console.error("Invalid form data:", validatedData.error);
        return {
            status: "error",
            message: "Invalid form data",
        };
    }

    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        console.error("editPost Error:", error);
        return {
            status: "error",
            message: "Unauthorized",
        };
    }

    const { title, content, tags, communityId, id } = validatedData.data;
    const userPerms = await getUserCommunityPermissions(
        user.id,
        communityId,
    );

    if (!userPerms || !hasPermission(userPerms, Permission.EDIT_POST)) {
        return {
            status: "error",
            message: "You do not have permission to create a post in this community",
        }
    }

    const jsonContent = JSON.parse(content);
    let thumbnail = "";
    for (const block of jsonContent) {
        if (block.type === "image") {
            thumbnail = block.data.file.url;
            break;
        }
    }

    const adminClient = createAdminClient();
    const { data, error: postError } = await adminClient
        .from('community_posts')
        .update({
            title,
            content,
            thumbnail,
            tags,
        })
        .eq('id', id)
        .eq('community_id', communityId)
        .eq('author_id', user.id)
        .select();

    if (postError || !data) {
        console.error("editPost Error:", postError);
        return {
            status: "error",
            message: "Failed to edit post",
        };
    }

    return {
        status: "success",
        id: data[0].id,
    };
}

/**
 * Pins or unpins a post.
 *
 * @param {number} postId - The ID of the post to pin or unpin.
 * @param {boolean} pin - Whether to pin (true) or unpin (false) the post.
 * @returns {Promise<Object>} A promise that resolves to an object containing the status.
 */
export async function pinPost(postId: number, pin: boolean) {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        console.error("pinPost Error:", error);
        return {
            status: "error",
            message: "Unauthorized",
        };
    }

    const { data, error: postError } = await supabase
        .from('community_posts')
        .select('community_id')
        .eq('id', postId)
        .single();

    if (postError || !data) {
        console.error("pinPost Error:", postError);
        return {
            status: "error",
            message: "Failed to pin post",
        };
    }

    const userPerms = await getUserCommunityPermissions(user.id, data.community_id);

    if (!userPerms || !hasPermission(userPerms, Permission.PIN_POST)) {
        return {
            status: "error",
            message: "You do not have permission to pin posts in this community",
        };
    }

    // Max 3 pinned posts
    const { data: pinnedPosts, error: pinnedError } = await supabase
        .from('community_posts')
        .select('id')
        .eq('community_id', data.community_id)
        .eq('is_pinned', true);

    if (pinnedError) {
        console.error("pinPost Error:", pinnedError);
        return {
            status: "error",
            message: "Failed to pin post",
        };
    }

    if (pin && pinnedPosts.length >= 3) {
        return {
            status: "error",
            message: "You can only pin up to 3 posts",
        };
    }

    const adminClient = createAdminClient();
    const { error: pinError } = await adminClient
        .from("community_posts")
        .update({ is_pinned: pin })
        .eq("id", postId);

    if (pinError) {
        console.error("pinPost Error:", pinError);
        return {
            status: "error",
            message: "Failed to pin post",
        };
    }

    return {
        status: "success",
    };
}