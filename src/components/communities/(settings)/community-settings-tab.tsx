'use client'

import {useCallback, useState} from 'react'
import {SubmitHandler, useForm} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { z } from 'zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Permission } from '@/types/communities/permissions'
import {usePermissions} from "@/hooks/use-permissions";
import {communityEditSchema} from "@/types/communities/communities";
import {useCommunity} from "@/components/communities/community-provider";
import {ImagePlus} from "lucide-react";
import {useDropzone} from "react-dropzone";
import {TagsInput} from "@/components/ui/tag-input";
import {useUser} from "@/components/user-provider";
import {deleteCommunity, editCommunity} from "@/app/dashboard/communities/actions/communities";
import {toast} from "@/hooks/use-toast";
import {useRouter} from "next/navigation";

type FormData = z.infer<typeof communityEditSchema>

/**
 * Component for displaying and editing community settings.
 *
 * @returns {JSX.Element} The rendered CommunitySettingsTab component.
 */
export default function CommunitySettingsTab() {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const { checkPermission } = usePermissions()
    const community = useCommunity()
    const user = useUser()
    const router = useRouter()
    const [icon, setIcon] = useState<string | ArrayBuffer | null>(community && community.icon ? community.icon : null)

    if (!user || !community) {
        return <h2>Failed to load settings...</h2>
    }

    const form = useForm<FormData>({
        resolver: zodResolver(communityEditSchema),
        defaultValues: {
            id: community.id,
            name: community.name,
            description: community.description,
            icon: new File([], ""),
            university: community.university,
            isDiscoverable: community.is_discoverable,
            tags: community.tags
        },
    })

    /**
     * Handles the form submission for updating community settings.
     *
     * @param {FormData} data - The data from the form.
     */
    const onSubmit : SubmitHandler<z.infer<typeof communityEditSchema>> = async (data) => {
        setIsUpdating(true)
        const result = await editCommunity(data)

        if (!result) {
            console.error('Failed to update community')
            setIsUpdating(false)
            return
        }

        if (result.status === "error") {
            console.error('Failed to update community:', result.message)
            toast({
                title: "Error updating community",
                description: result.message,
                variant: "destructive",
            })
            setIsUpdating(false)
            return
        }

        setIsUpdating(false)
        router.refresh()
    }

    /**
     * Handles the deletion of the community.
     */
    const handleDelete = async () => {
        setIsDeleting(true)
        const result = await deleteCommunity(community.id);

        if (result) {
            router.push("/dashboard/communities/")
        } else {
            toast({
                title: "Error deleting community",
                description: "Failed to delete community",
                variant: "destructive",
            })
        }
        setIsDeleting(false)
    }

    /**
     * Handles the file drop event for uploading an icon.
     *
     * @param {File[]} acceptedFiles - The files that were dropped.
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

    return (
        <div className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
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

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Community Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="university"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>University</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="isDiscoverable"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Discoverable</FormLabel>
                                    <FormDescription>
                                        Allow others to discover this community
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

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
                    <Button type="submit" disabled={!checkPermission(Permission.EDIT_COMMUNITY) || isUpdating}>{isUpdating ? "Updating settings..." : "Save Changes"}</Button>
                </form>
            </Form>

            {community.isOwner  && (
                <Alert variant="destructive">
                    <AlertTitle className="text-4xl font-extrabold text-center underline uppercase mb-4 text-red-500">Danger Zone</AlertTitle>
                    <AlertDescription>
                        <div className="flex flex-col border-t pt-2">
                            <h2 className="text-xl font-bold">Delete Community</h2>
                            <p className="text-sm">Deleting a community is irreversible. Please be certain.</p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={isDeleting} className="mt-2">{isDeleting ? "Deleting Community..." : "Delete Community"}</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your
                                            community and remove all data associated with it.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}