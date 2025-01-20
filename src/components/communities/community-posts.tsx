'use client'

import {useCommunity} from "@/components/communities/community-provider";
import {useRouter}from "next/navigation";
import {useCallback, useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Post} from "@/types/communities/communities";
import {createClient}from "@/utils/supabase/client";
import {useInView}from "react-intersection-observer";
import {PostCard}from "@/components/communities/(posts)/post-card";

interface CommunityPostsProps {
    initPosts?: Post[];
}

/**
 * Component for displaying and managing community posts.
 *
 * @param {CommunityPostsProps} props - The properties for the component.
 * @param {Post[]} [props.initPosts] - The initial list of posts.
 * @returns {JSX.Element | null} The rendered CommunityPosts component or null if no community or initial posts.
 */
export function CommunityPosts({ initPosts }: CommunityPostsProps) {
    const community = useCommunity()
    const router = useRouter()

    if (!community || !initPosts) {
        return null
    }

    const [posts, setPosts] = useState(initPosts)
    const [isLoading, setIsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    const supabase = createClient()
    const { ref, inView } = useInView({
        threshold: 0,
    })

    /**
     * Loads more posts when the user scrolls to the bottom.
     */
    const loadMorePosts = useCallback(async () => {
        if (isLoading || !hasMore) return
        if (posts.length === 0) return // no posts to load

        setIsLoading(true)
        const lastPost = posts[posts.length - 1]
        const { data: newPosts, error } = await supabase
            .from('community_posts')
            .select(`
        *,
         author:profiles!community_posts_author_id_fkey1(name, avatar_url),
         likes:community_likes(count),
         comments:community_comments(count)
      `)
            .eq('community_id', community.id)
            .lt('created_at', lastPost.created_at)
            .eq('type', 'POST')
            .eq('is_pinned', false)
            .order('created_at', { ascending: false })
            .limit(10)

        if (error || !newPosts) {
            console.error('Error loading more posts:', error)
            return
        }

        const { data: statusData, error: statusError } = await supabase.rpc('has_user_liked_bookmarked', {
            post_ids: newPosts.map(post => post.id), // Array of post IDs
        });

        if (statusError) {
            console.error('Error fetching liked/bookmarked statuses:', statusError);
            return;
        }

        const processedPosts = newPosts.map(post => {
            const statusInfo = statusData.find(
                (status: { post_id: any }) => status.post_id === post.id
            );
            return {
                ...post,
                userLiked: statusInfo?.user_liked || false,
                userBookmarked: statusInfo?.user_bookmarked || false
            };
        });

        setPosts((prevPosts) => [...prevPosts, ...processedPosts])
        setHasMore(newPosts.length === 10)
        setIsLoading(false)
    }, [isLoading, hasMore, posts, community])

    useEffect(() => {
        if (inView) {
            loadMorePosts()
        }
    }, [inView, loadMorePosts]);

    return (
        <div>
            <div className="flex justify-between items-center my-4">
                <h2 className="text-2xl font-bold">
                    Community Posts
                </h2>
                <Button
                    onClick={() => router.push(`/dashboard/communities/${community.id}/posts/create`)}
                >
                    Create Post
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <PostCard post={post} key={post.id} />
                ))}
            </div>
            {isLoading && <div className="text-center">Loading more posts...</div>}
            <div ref={ref} />
        </div>
    )
}