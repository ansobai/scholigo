'use client'

import {Post} from "@/types/communities/communities";
import {useState} from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Bookmark, Heart, MessageSquare} from "lucide-react";
import Link from "next/link";
import {useCommunity} from "@/components/communities/community-provider";
import Image from "next/image";
import {createClient} from "@/utils/supabase/client";
import {useUser} from "@/components/user-provider";

/**
 * Component for displaying a post card in a community.
 *
 * @param {{ post: Post }} props - The properties for the PostCard component.
 * @returns {JSX.Element} The rendered PostCard component.
 */
export function PostCard({ post }: { post: Post }) {
    const [likes, setLikes] = useState(post.likes[0]?.count || 0)
    const [hasLiked, setHasLiked] = useState(post.userLiked)
    const [hasBookmarked, setHasBookmarked] = useState(post.userBookmarked)
    const [comments] = useState(post.comments[0]?.count || 0)
    const community = useCommunity()
    const user = useUser()

    const sampleContent = parseContent(post.content)

    /**
     * Handles the like action for the post.
     */
    const handleLike = async () => {
        if (hasLiked) {
            setLikes(likes - 1)
            setHasLiked(false)

            const supabase = createClient()
            if (!user) return

            const { error } = await supabase
                .from('community_likes')
                .delete()
                .eq('post_id', post.id)
                .eq('user_id', user.id)

            if (error) {
                console.error("Failed to unlike post:", error)
                setLikes(likes + 1)
                setHasLiked(true)
            }
        } else {
            setLikes(likes + 1)
            setHasLiked(true)

            const supabase = createClient()
            if (!user) return

            const { error } = await supabase
                .from('community_likes')
                .insert({
                    post_id: post.id,
                    user_id: user.id
                })

            if (error) {
                console.error("Failed to like post:", error)
                setLikes(likes - 1)
                setHasLiked(false)
            }
        }
    }

    /**
     * Handles the bookmark action for the post.
     */
    const handleBookmark = async () => {
        if (hasBookmarked) {
            setHasBookmarked(false)

            const supabase = createClient()
            if (!user) return

            const { error } = await supabase
                .from('user_posts_bookmarks')
                .delete()
                .eq('post_id', post.id)
                .eq('user_id', user.id)

            if (error) {
                console.error("Failed to remove bookmark:", error)
                setHasBookmarked(true)
            }
        } else {
            setHasBookmarked(true)

            const supabase = createClient()
            if (!user) return

            const { error } = await supabase
                .from('user_posts_bookmarks')
                .insert({
                    post_id: post.id,
                    user_id: user.id
                })

            if (error) {
                console.error("Failed to bookmark post:", error)
                setHasBookmarked(false)
            }
        }
    }

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="flex-shrink-0">
                {post.thumbnail && (
                    <Image src={post.thumbnail} alt={`${post.title} thumbnail`} objectFit="cover" height={200} width={480} className="mb-4 rounded-md" />
                )}
                <CardTitle className="flex items-center gap-2 text-lightYellow">
                    {post.title}
                    {post.is_pinned && (
                        <Badge variant="secondary">Pinned</Badge>
                    )}
                </CardTitle>
                <CardDescription className="flex gap-2 items-center">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={post.author.avatar_url} alt={`${post.author.name}'s avatar`} />
                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-md font-bold">{post.author.name}</p>
                        <p className="text-sm text-gray-400">{new Date(post.created_at).toLocaleString()}</p>
                    </div>
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow overflow-hidden">
                <p className="line-clamp-4">{sampleContent}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="flex-shrink-0 mt-auto pt-4 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 justify-between w-full">
                    <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" size="sm" aria-label={hasLiked ? "Unlike post" : "Like post"} className={`${hasLiked ? "text-red-500" : ""} px-2`} onClick={handleLike}>
                            <Heart className={`mr-1 h-4 w-4 ${hasLiked ? "fill-current" : ""}`} />
                            <span className="text-xs">{likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="px-2">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            <span className="text-xs">{comments}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="px-2" aria-label={hasBookmarked ? "Remove Bookmark" : "Bookmark post"} onClick={handleBookmark}>
                            <Bookmark className={`w-4 h-4 mr-1 ${hasBookmarked ? 'fill-white' : ""}`} />
                            <span className="text-xs">{hasBookmarked ? "Bookmarked" : "Bookmark"}</span>
                        </Button>
                    </div>
                    <Link href={`/dashboard/communities/${community?.id}/posts/${post.id}`} className="w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="w-full">
                            Read More
                        </Button>
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}

/**
 * Parses the content of a post to extract a sample text.
 *
 * @param {string} content - The content of the post in JSON format.
 * @returns {string} The parsed sample content.
 */
function parseContent(content: string) {
    try {
        const json = JSON.parse(content)

        if (!Array.isArray(json)) {
            return "Failed to load content..."
        }

        let text = ""
        let count = 0

        for (const element of json) {
            if ((element.type === "paragraph" || element.type === "header") && count < 5) {
                text += element.data.text + " ";
                count++;
            }

            if (count >= 5) break;
        }

        // Trim the trailing space and print the result
        text = text.trim().substring(0, 200) + "...";

        return text;
    } catch (e) {
        console.error("Failed to parse content:", e)
        return "Failed to load content..."
    }
}