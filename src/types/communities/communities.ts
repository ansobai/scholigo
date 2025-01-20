import z from "zod";

export interface Communities {
    id: string,
    name: string,
    description?: string,
    members_count?: number,
    icon?: string,
    university?: string,
    is_discoverable: boolean,
    tags?: string[],
    created_by: string,
    createdAt: string,
}

export interface UserCommunities extends Communities {
    isOwner: boolean,
    isMember: boolean,
}

/**
 * Schema for creating a community.
 */
export const communityCreateSchema = z.object({
    name: z.string().min(3, {
        message: "Please enter a community name"
    }).max(15, {
        message: "Community name must be less than 15 characters"
    }),
    description: z.string().max(60, {
        message: "Community description must be less than 60 characters"
    }).nullish(),
    icon: z.instanceof(File)
        .refine((file) => file.size < 5000000, {
            message: "File size must be less than 5MB",
        }).optional(),
    university: z.string().max(20, {
        message: "University name must be less than 20 characters"
    }).nullish(),
    isDiscoverable: z.boolean(),
    tags: z.array(z.string()).max(5, {
        message: "You can only have up to 5 tags"
    }).nullish(),
})

/**
 * Schema for editing a community.
 */
export const communityEditSchema = communityCreateSchema.extend({
    id: z.string(),
})

/**
 * Schema for creating a community post.
 */
export const communityCreatePostsSchema = z.object({
    communityId: z.string(),
    title: z.string().min(3, {
        message: "Please enter a post title"
    }).max(40, {
        message: "Post title must be less than 40 characters"
    }),
    content: z.string().min(1, {
        message: "Post content is empty"
    }),
    tags: z.array(z.string()).max(5, {
        message: "You can only have up to 5 tags"
    }).nullish(),
})

/**
 * Schema for editing a community post.
 */
export const communityEditPostSchema = communityCreatePostsSchema.extend({
    id: z.number(),
})

export interface Post {
    id: number
    author_id: string
    community_id: string
    title: string
    content: string
    type: 'post' | 'update'
    thumbnail: string | null
    is_pinned: boolean
    tags: string[]
    created_at: string
    author: {
        id: string
        name: string
        avatar_url: string
    }
    likes: { count: number }[]
    comments: { count: number }[]
    userLiked: boolean
    userBookmarked: boolean
}

/**
 * Schema for creating a comment.
 */
export const commentSchema = z.object({
    content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment is too long (max 500 characters)'),
})

export interface PostComment {
    id: number,
    content: string,
    created_at: string,
    author: {
        id: string,
        name: string,
        avatar_url: string,
    }
}

/**
 * Schema for creating a role.
 */
export const roleSchema = z.object({
    name: z.string().min(1, 'Role name is required').max(20),
    color: z.string().regex(/^#[0-9A-F]{6}$/i),
    permissions: z.number(),
    community_id: z.string(),
})

export type Role = {
    id: number
    name: string
    color: string
    permissions: number
    community_id: string
}

export type Member = {
    id: string
    name: string
    avatar_url: string | null
    community_members: {
        joined_at: string
    }
    user_roles: Array<{
        role_id: number
        roles: {
            name: string
            color: string
            permissions: number
        }
    }>
}