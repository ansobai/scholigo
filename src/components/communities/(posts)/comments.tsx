"use client";

import {
    commentSchema,
    Post,
    PostComment,
} from "@/types/communities/communities";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/utils/supabase/client";
import { addPostComment, deletePostComment } from "@/app/dashboard/communities/actions/posts";
import { toast } from "@/hooks/use-toast";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/components/user-provider";
import { usePermissions } from "@/hooks/use-permissions";
import { Permission } from "@/types/communities/permissions";
import { Trash2 } from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";

interface CommentsProps {
    post: Post;
    onCommentChange?: (added: boolean) => void;
}

/**
 * Component for displaying and managing comments on a post.
 *
 * @param {CommentsProps} props - The properties for the Comments component.
 * @returns {JSX.Element} The rendered Comments component.
 */
export default function Comments({ post, onCommentChange }: CommentsProps) {
    const initialized = useRef(false);
    const [comments, setComments] = useState<PostComment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isAddingComment, setIsAddingComment] = useState(false);

    const user = useUser();
    const { checkPermission } = usePermissions();

    const form = useForm<z.infer<typeof commentSchema>>({
        resolver: zodResolver(commentSchema),
        defaultValues: {
            content: "",
        },
    });

    /**
     * Loads more comments for the post.
     */
    const loadMoreComments = useCallback(async () => {
        if (!hasMore) return;

        const supabase = createClient();
        let query = supabase
            .from("community_comments")
            .select(
                `
        id,
        content,
        created_at,
        author:profiles(id, name, avatar_url)
      `,
            )
            .eq("post_id", post.id)
            .order("created_at", { ascending: false })
            .limit(10);

        if (comments.length > 0) {
            query = query.lt("created_at", comments[comments.length - 1].created_at);
        }

        const { data, error } = await query;

        if (error || !data) {
            console.error("Error fetching comments:", error);
            return;
        }

        const processedComments: PostComment[] = data.map((comment) => {
            const { author, ...rest } = comment;
            return {
                ...rest,
                author: author as unknown as {
                    id: string;
                    name: string;
                    avatar_url: string;
                },
            };
        });

        setComments((prevComments) => [...prevComments, ...processedComments]);
        setHasMore(data.length === 10);
        setIsLoading(false);
    }, [isLoading, hasMore, comments, post]);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            setIsLoading(true);
            loadMoreComments();
        }
    }, []);

    /**
     * Handles the submission of a new comment.
     *
     * @param {z.infer<typeof commentSchema>} data - The data of the comment to be added.
     */
    const handleCommentSubmit = async (data: z.infer<typeof commentSchema>) => {
        setIsAddingComment(true);
        const result = await addPostComment(post.id, data);

        if (!result) {
            console.error("Failed to add comment");
            setIsAddingComment(false);
            return;
        }

        if (result.status === "error") {
            console.error("Failed to add comment:", result.message);
            toast({
                title: "Failed to add comment",
                description: result.message,
                variant: "destructive",
            });
            setIsAddingComment(false);
            return;
        }

        if (result.status === "success" && result.comment) {
            setComments((prevComments) => [result.comment, ...prevComments]);
            form.reset();
            onCommentChange?.(true);
            setIsAddingComment(false);
        }
    };

    /**
     * Handles the deletion of a comment.
     *
     * @param {PostComment} comment - The comment to be deleted.
     */
    const handleDeleteComment = async (comment: PostComment) => {
        if (comment.author.id !== user?.id) {
            if (!checkPermission(Permission.DELETE_COMMENT)) {
                toast({
                    title: "Unauthorized",
                    description: "You are not allowed to delete this comment",
                    variant: "destructive",
                });
                return;
            }

            // Optimistically delete the comment
            const commentIndex = comments.findIndex((c) => c.id === comment.id);
            setComments((prevComments) => prevComments.filter((c) => c.id !== comment.id));
            onCommentChange?.(false);
            const result = await deletePostComment(post.id, comment.id);

            if (!result) {
                console.error("Failed to delete comment");
                toast({
                    title: "Failed to delete comment",
                    description: "An error occurred while deleting the comment",
                    variant: "destructive",
                });
                setComments((prevComments) => {
                    prevComments.splice(commentIndex, 0, comment);
                    return prevComments;
                });
                onCommentChange?.(true);
                return;
            }

            if (result.status === "error") {
                console.error("Failed to delete comment:", result.message);
                toast({
                    title: "Failed to delete comment",
                    description: result.message,
                    variant: "destructive",
                });

                setComments((prevComments) => {
                    prevComments.splice(commentIndex, 0, comment);
                    return prevComments;
                });
                onCommentChange?.(true);
                return;
            }
        } else {
            const supabase = createClient();

            const { error } = await supabase
                .from("community_comments")
                .delete()
                .eq("id", comment.id);

            if (error) {
                console.error("Failed to delete comment:", error);
                toast({
                    title: "Failed to delete comment",
                    description: "An error occurred while deleting the comment",
                    variant: "destructive",
                });
                return;
            }

            setComments((prevComments) => prevComments.filter((c) => c.id !== comment.id));
            onCommentChange?.(false);
        }
    }

    return (
        <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Comments</h3>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleCommentSubmit)}
                    className="space-y-4"
                >
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea placeholder="Add a comment..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isAddingComment}>
                        {isAddingComment ? "Posting Comment..." : "Post Comment"}
                    </Button>
                </form>
            </Form>
            <div className="mt-6 space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex flex-row justify-between">
                        <div className="flex space-x-4">
                            <Avatar>
                                <AvatarImage src={comment.author.avatar_url} />
                                <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{comment.author.name}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(comment.created_at).toLocaleString()}
                                </p>
                                <p className="mt-1">{comment.content}</p>
                            </div>
                        </div>

                        <div>
                            {(checkPermission(Permission.DELETE_COMMENT) || comment.author.id === user?.id) && (
                                <AlertDialog>
                                    <AlertDialogTrigger>
                                        <Trash2 className="text-red-500 hover:bg-red-500 hover:text-white h-9 w-9 rounded-md p-2" />
                                    </AlertDialogTrigger>

                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure you want to delete this comment?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the comment
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteComment(comment)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>
                ))}

                {!isLoading && hasMore && (
                    <Button
                        variant="link"
                        onClick={() => {
                            setIsLoading(true);
                            loadMoreComments();
                        }}
                    >
                        Load More Comments
                    </Button>
                )}

                {isLoading && <p>Loading...</p>}
            </div>
        </div>
    );
}