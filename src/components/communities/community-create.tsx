'use client'

import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {ScrollArea} from "@/components/ui/scroll-area";
import {SubmitHandler, useForm} from "react-hook-form";
import z from "zod";
import {communityCreateSchema} from "@/types/communities/communities";
import {zodResolver} from "@hookform/resolvers/zod";
import {useCallback, useState} from "react";
import {useDropzone} from "react-dropzone";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {ImagePlus} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Switch} from "@/components/ui/switch";
import {createCommunity} from "@/app/dashboard/communities/actions/communities";
import {toast} from "@/hooks/use-toast";
import {useRouter} from "next/navigation";
import {TagsInput} from "@/components/ui/tag-input";
import {Spinner} from "@/components/ui/spinner";

/**
 * Component for creating a new community.
 *
 * @returns {JSX.Element} The rendered CreateCommunitiesModal component.
 */
export default function CreateCommunitiesModal() {
    const form = useForm<z.infer<typeof communityCreateSchema>>({
        resolver: zodResolver(communityCreateSchema),
        defaultValues: {
            name: "",
            description: "",
            icon: new File([], ""),
            university: "",
            isDiscoverable: true,
            tags: [],
        }
    })
    const router = useRouter()

    const [icon, setIcon] = useState<string | ArrayBuffer | null>("")
    const [loading, setLoading] = useState(false)

    /**
     * Handles the file drop event for the community icon.
     *
     * @param {File[]} acceptedFiles - The accepted files.
     */
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const reader = new FileReader();
            try {
                reader.onload = () => setIcon(reader.result);
                reader.readAsDataURL(acceptedFiles[0]);
                form.setValue("icon", acceptedFiles[0]);
                form.clearErrors("icon");
            } catch (error) {
                setIcon(null);
                form.resetField("icon");
            }
        },
        [form],
    );

    const { getRootProps, getInputProps, isDragActive, fileRejections } =
        useDropzone({
            onDrop,
            maxFiles: 1,
            maxSize: 5000000,
            accept: { "image/png": [], "image/jpg": [], "image/jpeg": [] },
        });

    /**
     * Handles the form submission for creating a community.
     *
     * @param {z.infer<typeof communityCreateSchema>} data - The data from the form.
     */
    const handleCommunityCreate: SubmitHandler<z.infer<typeof communityCreateSchema>> = async (data) => {
        setLoading(true);
        const result = await createCommunity(data);

        if (!result || !result.status) {
            console.error("Error creating community:", result.message);
            setLoading(false);
            return;
        }

        if (result.status === "error") {
            console.log("Error creating community:", result.message);
            toast({
                title: "Error creating community",
                description: result.message,
                variant: "destructive",
            })
            setLoading(false);
        } else router.push(`/dashboard/communities/${result.id}`)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Create Community</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <ScrollArea className="max-h-[80vh] p-3">
                    <DialogHeader>
                        <DialogTitle>Create Community</DialogTitle>
                        <DialogDescription>
                            Create a community to share your interests with others.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form className="space-y-3" onSubmit={form.handleSubmit(handleCommunityCreate)}>
                            <FormField control={form.control} name="icon" render={({field}) => (
                                <FormItem className="pt-4 md:w-1/2">
                                    <FormControl>
                                        <div
                                            {...getRootProps()}
                                            className="mx-auto flex cursor-pointer flex-row items-center justify-center gap-y-2 rounded-lg border border-foreground p-2 shadow-sm shadow-foreground"
                                        >
                                            {icon && (
                                                <img
                                                    src={icon as string}
                                                    alt="Uploaded image"
                                                    className="max-h-[400px] rounded-lg"
                                                />
                                            )}
                                            <ImagePlus
                                                className={`size-30 ${icon ? "hidden" : "block"}`}
                                            />
                                            <Input {...getInputProps()} type="file"/>
                                            {isDragActive ? (
                                                <p className={icon ? "hidden" : "block"}>Drop the image!</p>
                                            ) : (
                                                <p className={icon ? "hidden" : "block"}>Click or drag</p>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Upload your icon
                                    </FormDescription>
                                    <FormMessage>
                                        {fileRejections.length !== 0 && (
                                            <p>
                                                Image must be less than 1MB and of type png, jpg, or jpeg
                                            </p>
                                        )}
                                    </FormMessage>
                                </FormItem>
                            )}/>

                            <FormField control={form.control} name="name" render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-white">Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Name" type="text" {...field} className="w-80"/>
                                    </FormControl>
                                    <FormDescription>
                                        Enter the community name
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}/>

                            <FormField control={form.control} name="description" render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-white">Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Community Description" className="resize-none w-80" {...field} value={field.value ?? ""}/>
                                    </FormControl>
                                    <FormDescription>
                                        Enter the community description
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}/>

                            <FormField control={form.control} name="university" render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-white">University</FormLabel>
                                    <FormControl>
                                        <Input placeholder="University" type="text" {...field} className="w-80" value={field.value ?? ""}/>
                                    </FormControl>
                                    <FormDescription>
                                        Enter your university
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}/>

                            <FormField control={form.control} name="isDiscoverable" render={({field}) => (
                                <FormItem>
                                    <div className="flex items-center">
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                        <FormLabel className="text-white ml-2">Discoverable</FormLabel>
                                    </div>
                                    <FormDescription>
                                        {field.value ? "This will make your community visible to anyone" :
                                            "This will make your community private"}
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}/>

                            <FormField control={form.control} name="tags" render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-white">Tags</FormLabel>
                                    <FormControl>
                                        <TagsInput value={field.value == null ? [""] : field.value} onValueChange={field.onChange}
                                                   placeholder="Tags" className="w-80"/>
                                    </FormControl>
                                    <FormDescription>
                                        Tags help others find your community
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}/>

                            <Button type="submit" disabled={loading}>{loading ? "Creating Community..." : "Create Community"}</Button>
                        </form>
                    </Form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}