"use client";

import type { Post } from "@/types/communities/communities";
import { useState } from "react";
import { useCommunity } from "@/components/communities/community-provider";
import { useUser } from "@/components/user-provider";
import { usePermissions } from "@/hooks/use-permissions";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Permission } from "@/types/communities/permissions";
import {Button} from "@/components/ui/button";
import {Bookmark, Edit, Heart, MessageSquare, Pin, PinOff, Share2, Trash2} from "lucide-react";
import Editor from "@/components/communities/(posts)/editor";
import {OutputBlockData} from "@editorjs/editorjs";
import {Badge} from "@/components/ui/badge";
import {createClient} from "@/utils/supabase/client";
import Link from "next/link";
import Comments from "@/components/communities/(posts)/comments";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {deletePost, pinPost} from "@/app/dashboard/communities/actions/posts";
import {toast} from "@/hooks/use-toast";
import {useRouter} from "next/navigation";

interface PostProps {
    post: Post;
}

/**
 * Component for displaying a post in a community.
 *
 * @param {PostProps} props - The properties for the Post component.
 * @returns {JSX.Element} The rendered Post component.
 */
export function Post({ post }: PostProps) {
    const [likes, setLikes] = useState(post.likes[0]?.count || 0);
    const [hasLiked, setHasLiked] = useState(post.userLiked);
    const [hasBookmarked, setHasBookmarked] = useState(post.userBookmarked)
    const [isPinned, setIsPinned] = useState(post.is_pinned);
    const [comments, setComments] = useState(post.comments[0]?.count || 0);
    const [showComments, setShowComments] = useState(false);

    const community = useCommunity();
    const user = useUser();
    const router = useRouter();
    const { checkPermission } = usePermissions();

    if (!community) {
        return null;
    }

    const postContent: OutputBlockData[] = JSON.parse(post.content);

    /**
     * Handles the like action for the post.
     */
    const handleLike = async () => {
        if (hasLiked) {
            setLikes(likes - 1);
            setHasLiked(false);

            const supabase = createClient();
            if (!user) return;

            const { error } = await supabase
                .from('community_likes')
                .delete()
                .eq('post_id', post.id)
                .eq('user_id', user.id);

            if (error) {
                console.error("Failed to unlike post:", error);
                setLikes(likes + 1);
                setHasLiked(true);
            }
        } else {
            setLikes(likes + 1);
            setHasLiked(true);

            const supabase = createClient();
            if (!user) return;

            const { error } = await supabase
                .from('community_likes')
                .insert({
                    post_id: post.id,
                    user_id: user.id
                });

            if (error) {
                console.error("Failed to like post:", error);
                setLikes(likes - 1);
                setHasLiked(false);
            }
        }
    };

    /**
     * Handles the bookmark action for the post.
     */
    const handleBookmark = async () => {
        if (hasBookmarked) {
            setHasBookmarked(false);

            const supabase = createClient();
            if (!user) return;

            const { error } = await supabase
                .from('user_posts_bookmarks')
                .delete()
                .eq('post_id', post.id)
                .eq('user_id', user.id);

            if (error) {
                console.error("Failed to remove bookmark:", error);
                setHasBookmarked(true);
            }
        } else {
            setHasBookmarked(true);

            const supabase = createClient();
            if (!user) return;

            const { error } = await supabase
                .from('user_posts_bookmarks')
                .insert({
                    post_id: post.id,
                    user_id: user.id
                });

            if (error) {
                console.error("Failed to bookmark post:", error);
                setHasBookmarked(false);
            }
        }
    };

    /**
     * Handles changes in the comments count.
     *
     * @param {boolean} added - Indicates if a comment was added or removed.
     */
    const handleCommentChange = (added: boolean) => {
        if (added) {
            setComments(comments + 1);
        } else {
            setComments(comments - 1);
        }
    };

    /**
     * Handles the share action for the post.
     */
    const handleShare = async () => {
        // Implement share functionality
    };

    /**
     * Handles the delete action for the post.
     */
    const handleDelete = async () => {
        const result = await deletePost(post.id);

        if (!result) {
            console.error("Failed to delete post");
            return;
        }

        if (result.status === "error") {
            console.error("Failed to delete post:", result.message);
            toast({
                title: "Failed to delete post",
                description: result.message,
                variant: "destructive",
            });
            return;
        }

        router.push(`/dashboard/communities/${community.id}`);
    };

    /**
     * Handles the pin/unpin action for the post.
     */
    const handlePinned = async () => {
        const pinned = !isPinned;
        setIsPinned(pinned);

        const result = await pinPost(post.id, pinned);

        if (!result) {
            console.error("Failed to pin post");
            return;
        }

        if (result.status === "error") {
            console.error("Failed to pin post:", result.message);
            toast({
                title: "Failed to pin post",
                description: result.message,
                variant: "destructive",
            });
            setIsPinned(!pinned);
            return;
        }

        toast({
            title: `Post ${pinned ? "pinned" : "unpinned"}`,
            description: `Post has been ${pinned ? "pinned" : "unpinned"}`,
            variant: "success",
        });
    };

    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="flex flex-col md:flex-row justify-between items-start">
                <div className="flex items-center space-x-4">
                    <Avatar>
                        <AvatarImage src={post.author.avatar_url} alt={post.author.name} />
                        <AvatarFallback>
                            {post.author.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lightYellow text-2xl">
                        <div className="flex items-center gap-3">
                            {post.title}
                            {isPinned && (
                                <Badge variant="outline">Pinned</Badge>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 font-normal">
                            Posted by {post.author.name} on{" "}
                            {new Date(post.created_at).toLocaleDateString()}
                        </p>
                    </CardTitle>
                </div>

                <div className="flex items-center space-x-2">
                    {(checkPermission(Permission.EDIT_POST) && post.author.id === user?.id) && (
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/communities/${community?.id}/posts/${post.id}/edit`)}>
                            <Edit className="h-8 w-8" />
                        </Button>
                    )}

                    {checkPermission(Permission.DELETE_POST) && (
                        <AlertDialog>
                            <AlertDialogTrigger>
                                <Trash2 className="text-red-500 hover:bg-red-500 hover:text-white h-9 w-9 rounded-md p-2" />
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the post
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    {checkPermission(Permission.PIN_POST) && (
                        <Button variant="ghost" size="icon" onClick={handlePinned}>
                            {isPinned ? (
                                <PinOff className="h-8 w-8" />
                            ) : (
                                <Pin className="h-8 w-8" />
                            )}
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                <Editor community={community} data={postContent} isReadOnly={true} editorblock="editorjs-container" />
                <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="flex justify-between items-center">
                <div className="flex space-x-4">
                    <Button variant="ghost" size="sm" aria-label={hasLiked ? "Unlike post" : "Like post"} className={hasLiked ? "text-red-500" : ""} onClick={handleLike}>
                        <Heart className={`mr-2 h-4 w-4 ${hasLiked ? "fill-current" : ""}`} />
                        {likes}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} aria-label={showComments ? "Hide comments" : "Show comments"}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {comments}
                    </Button>
                    <Button variant="ghost" size="sm" aria-label={hasBookmarked ? "Remove Bookmark" : "Bookmark post"} onClick={handleBookmark}>
                        <Bookmark className={`w-4 h-4 mr-2 ${hasBookmarked ? 'fill-white' : ""}`} />
                        {hasBookmarked ? "Bookmarked" : "Bookmark"}
                    </Button>
                </div>
                <div className="flex space-x-2">
                    <Link href={`/dashboard/communities/${community.id}`}>
                        <Button variant="outline" size="sm">
                            Back to Community
                        </Button>
                    </Link>
                </div>
            </CardFooter>

            <CardContent className={`${!showComments ? 'hidden' : 'block'}`}>
                <Comments post={post} onCommentChange={handleCommentChange} />
            </CardContent>
        </Card>
    );
}