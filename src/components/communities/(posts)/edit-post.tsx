'use client'

import {communityCreatePostsSchema, communityEditPostSchema, Post, UserCommunities} from "@/types/communities/communities";
import {useRouter} from "next/navigation";
import {SubmitHandler, useForm} from "react-hook-form";
import z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {OutputBlockData, OutputData} from "@editorjs/editorjs";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import Editor from "@/components/communities/(posts)/editor";
import {TagsInput} from "@/components/ui/tag-input";
import {Button} from "@/components/ui/button";
import {createPost, editPost} from "@/app/dashboard/communities/actions/posts";
import {toast} from "@/hooks/use-toast";

interface EditPostProps {
    community: UserCommunities,
    post: Post
}

/**
 * Component for editing an existing post in a community.
 *
 * @param {EditPostProps} props - The properties for the EditPost component.
 * @returns {JSX.Element} The rendered EditPost component.
 */
export default function EditPost({community, post}: EditPostProps) {
    const router = useRouter()
    const form = useForm<z.infer<typeof communityEditPostSchema>>({
        resolver: zodResolver(communityEditPostSchema),
        defaultValues: {
            id: post.id,
            communityId: community.id,
            title: post.title,
            content: "",
            tags: post.tags
        }
    })

    /**
     * Handles changes in the editor content.
     *
     * @param {OutputData} data - The editor data.
     */
    const onChange = (data: OutputData) => {
        form.setValue("content", JSON.stringify(data.blocks));
    }

    /**
     * Handles the submission of the post edit form.
     *
     * @param {z.infer<typeof communityEditPostSchema>} data - The data of the post to be edited.
     */
    const handlePostEdit: SubmitHandler<z.infer<typeof communityEditPostSchema>>  = async (data) => {
        const result = await editPost(data);

        if (!result) {
            console.error("Failed to edit post");
            return;
        }

        if (result.status === "error") {
            console.error("Failed to edit post:", result.message);
            toast({
                title: "Failed to edit post",
                description: result.message,
                variant: "destructive"
            })
            return;
        }

        router.push(`/dashboard/communities/${community.id}/posts/${result.id}`);
    }

    return (
        <div className="container mx-auto p-10">
            <Card>
                <CardHeader className="pb-1">
                    <CardTitle className="text-4xl text-lightYellow">Edit Post</CardTitle>
                    <CardDescription className="pl-1">Edit Post {post.title}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handlePostEdit)} className="space-y-8">
                            <input type="hidden" value={community.id} {...form.register("communityId")} />
                            <input type="hidden" value={post.id} {...form.register("id")} />

                            <FormField control={form.control} name="title" render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-white">Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your post title" type="text" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This will be the main title of your post.
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}/>

                            <div>
                                <FormField control={form.control} name="content" render={({field}) => (
                                    <FormItem>
                                        <FormLabel className="text-white">Content</FormLabel>
                                        <FormControl>
                                            <Editor community={community} data={JSON.parse(post.content)} onChange={onChange} editorblock="editorjs-container" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>

                            <FormField control={form.control} name="tags" render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-white">Tags</FormLabel>
                                    <FormControl>
                                        <TagsInput maxItems={5} value={field.value == null ? [""] : field.value} onValueChange={field.onChange}
                                                   placeholder="Add tags (press Enter to add)"/>
                                    </FormControl>
                                    <FormDescription>
                                        Add up to 5 tags to categorize your post.
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}/>

                            <Button type="submit" className="w-full">Edit Post</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}