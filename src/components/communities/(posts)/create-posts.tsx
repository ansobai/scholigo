'use client'

import Editor from "@/components/communities/(posts)/editor";
import {communityCreatePostsSchema, UserCommunities} from "@/types/communities/communities";
import {OutputData} from "@editorjs/editorjs";
import {SubmitHandler, useForm} from "react-hook-form";
import z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {TagsInput} from "@/components/ui/tag-input";
import {Button} from "@/components/ui/button";
import {createPost} from "@/app/dashboard/communities/actions/posts";
import {toast} from "@/hooks/use-toast";
import {useRouter} from "next/navigation";

interface CreatePostsProps {
    community: UserCommunities
}

/**
 * Component for creating a new post in a community.
 *
 * @param {CreatePostsProps} props - The properties for the CreatePosts component.
 * @returns {JSX.Element} The rendered CreatePosts component.
 */
export default function CreatePosts({ community }: CreatePostsProps) {
    const router = useRouter();
    const form = useForm<z.infer<typeof communityCreatePostsSchema>>({
        resolver: zodResolver(communityCreatePostsSchema),
        defaultValues: {
            communityId: community.id,
            title: "",
            content: "",
            tags: []
        }
    })

    /**
     * Handles changes in the editor content.
     *
     * @param {OutputData} data - The editor data.
     */
    const onChange = (data: OutputData) => {
        // form.setValue("content", data.blocks.map(block => JSON.stringify(block)));
        form.setValue("content", JSON.stringify(data.blocks));
    }

    /**
     * Handles the submission of the post form.
     *
     * @param {z.infer<typeof communityCreatePostsSchema>} data - The data of the post to be created.
     */
    const handlePostSubmit: SubmitHandler<z.infer<typeof communityCreatePostsSchema>>  = async (data) => {
        const result = await createPost(data);

        if (!result) {
            console.error("Failed to create post");
            return;
        }

        if (result.status === "error") {
            console.error("Failed to create post:", result.message);
            toast({
                title: "Failed to create post",
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
                    <CardTitle className="text-4xl text-lightYellow">Create a New Post</CardTitle>
                    <CardDescription className="pl-1">Share your thoughts with the community</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handlePostSubmit)} className="space-y-8">
                            <input type="hidden" value={community.id} {...form.register("communityId")} />

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
                                            <Editor community={community} onChange={onChange} editorblock="editorjs-container" />
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

                            <Button type="submit" className="w-full">Create Post</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}