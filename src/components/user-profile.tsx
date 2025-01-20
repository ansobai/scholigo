'use client'

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Book, Calendar, Goal, ImagePlus, University, UserPen} from "lucide-react";
import {formatTime} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Profile, profileSchema} from "@/types/profile";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {TagsInput} from "@/components/ui/tag-input";
import {useDropzone} from "react-dropzone";
import {useCallback, useState} from "react";
import {ScrollArea} from "@/components/ui/scroll-area";
import {useToast} from "@/hooks/use-toast";
import {updateUserProfile} from "@/utils/profile";

export type UserProfileProps = {
    profile: Profile,
    isEditable: boolean
}

export function UserProfile({ profile, isEditable} : UserProfileProps) {

    return (
        <Card className="w-fit">
            <CardHeader>
                <CardTitle className="flex flex-row gap-4">
                    <Avatar>
                        <AvatarImage src={profile.avatar_url} alt={`${profile.name}'s Avatar`}/>
                        <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col gap-1 pt-1">
                        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight text-lightYellow">
                            {profile.name}
                        </h3>
                        {profile.field && (
                            <p className="leading-7 text-white text-sm -translate-y-3">
                                {profile.field}
                            </p>
                        )}
                    </div>

                    {isEditable && (
                        <UserProfileEdit {...profile} />
                    )}
                </CardTitle>

                {profile.interests && (
                    <CardDescription>
                        <UserProfileInterests interests={profile.interests} />
                    </CardDescription>
                )}

                <CardContent className="flex flex-col pl-2 gap-3">
                    <div className="flex flex-row gap-2">
                        <Book size={24} className="text-lightYellow"/>

                        <p className="leading-7 text-white">
                            {profile.bio ? profile.bio : "No bio available"}
                        </p>
                    </div>

                    <div className="flex flex-row gap-2">
                        <University size={24} className="text-lightYellow"/>

                        <p className="leading-7 text-white">
                            {profile.university ? profile.university : "University not mentioned"}
                        </p>
                    </div>

                    <div className="flex flex-row gap-2">
                        <Goal size={24} className="text-lightYellow"/>

                        <p className="leading-7 text-white">
                            {profile.daily_goal ? `${formatTime(profile.daily_goal)}` : "No daily goal set"}
                        </p>
                    </div>

                    <div className="flex flex-row gap-2">
                        <Calendar size={24} className="text-lightYellow"/>

                        <p className="leading-7 text-white">
                            {profile.monthly_goal ? `${formatTime(profile.monthly_goal)}` : "No monthly goal set"}
                        </p>
                    </div>
                </CardContent>
            </CardHeader>
        </Card>
    )
}

function UserProfileInterests({interests}: { interests: string[] }) {
    return (
        <div className="flex flex-row gap-2 max-w-md my-2">
            {interests.map((interest, index) => (
                <Badge key={index} variant="outline">
                    {interest}
                </Badge>
            ))}
        </div>
    )
}

function UserProfileEdit(profile: Profile) {
    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: profile.name,
            avatar: new File([], ""),
            bio: profile.bio,
            field: profile.field,
            university: profile.university,
            dailyGoal: profile.daily_goal / 60,
            monthlyGoal: profile.monthly_goal / 3600,
            interests: profile.interests
        }
    })

    const [avatar, setAvatar] = useState<string | ArrayBuffer | null>("");

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const reader = new FileReader();
            try {
                reader.onload = () => setAvatar(reader.result);
                reader.readAsDataURL(acceptedFiles[0]);
                form.setValue("avatar", acceptedFiles[0]);
                form.clearErrors("avatar");
            } catch (error) {
                setAvatar(profile.avatar_url === undefined ? null : profile.avatar_url);
                form.resetField("avatar");
            }
        },
        [form],
    );

    const { getRootProps, getInputProps, isDragActive, fileRejections } =
        useDropzone({
            onDrop,
            maxFiles: 1,
            maxSize: 1000000,
            accept: { "image/png": [], "image/jpg": [], "image/jpeg": [] },
        });

    const {toast} = useToast();

    const handleProfileUpdate: SubmitHandler<z.infer<typeof profileSchema>> = async (data) => {
        const result = await updateUserProfile(profile, data);

        if (!result || !result.status) {
            console.error("Invalid result returned from updateUserProfile:", result);
            return;
        }

        if (result.status === "error") {
            console.log("Profile update failed with message:", result.message);
            toast({
                title: "Error",
                description: result.message,
                variant: "destructive"
            });
        }

        if (result.status === "success") {
            toast({
                title: "Success",
                description: result.message,
                variant: "success"
            });

            // Reload the page
            window.location.reload();
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="ml-4">
                    <UserPen size={24} className="text-white"/>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <ScrollArea className="max-h-[80vh] p-3">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                            Update your profile information.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form className="space-y-3" onSubmit={form.handleSubmit(handleProfileUpdate)}>
                            <div className="flex flex-row justify-between pt-4 gap-10">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={profile.avatar_url} alt={`${profile.name}'s Avatar`}/>
                                    <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>

                                <FormField control={form.control} name="avatar" render={({field}) => (
                                    <FormItem className="mx-auto md:w-1/2">
                                        <FormControl>
                                            <div
                                                {...getRootProps()}
                                                className="mx-auto flex cursor-pointer flex-row items-center justify-center gap-y-2 rounded-lg border border-foreground p-2 shadow-sm shadow-foreground"
                                            >
                                                {avatar && (
                                                    <img
                                                        src={avatar as string}
                                                        alt="Uploaded image"
                                                        className="max-h-[400px] rounded-lg"
                                                    />
                                                )}
                                                <ImagePlus
                                                    className={`size-30 ${avatar ? "hidden" : "block"}`}
                                                />
                                                <Input {...getInputProps()} type="file" />
                                                {isDragActive ? (
                                                    <p className={avatar ? "hidden" : "block"}>Drop the image!</p>
                                                ) : (
                                                    <p className={avatar ? "hidden" : "block"}>Click or drag</p>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormDescription>
                                            Upload your avatar
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
                            </div>
                            <FormField control={form.control} name="name" render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-white">Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Name" type="text" {...field} className="w-80"/>
                                    </FormControl>
                                    <FormDescription>
                                        Enter your name address
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}/>

                            <FormField control={form.control} name="bio" render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-white">Bio</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Tell us a little bit about yourself" className="resize-none w-80" {...field} value={field.value ?? ""}/>
                                    </FormControl>
                                    <FormDescription>
                                        Enter your bio
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}/>

                            <FormField control={form.control} name="field" render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-white">Field</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Field" type="text" {...field} className="w-80" value={field.value ?? ""}/>
                                    </FormControl>
                                    <FormDescription>
                                        Enter your field
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

                            <FormField control={form.control} name="dailyGoal" render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-white">Daily Goal</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Daily Goal" type="number" {...field} onChange={(event) => field.onChange(Number(event.target.value))} className="w-80"/>
                                    </FormControl>
                                    <FormDescription>
                                        Enter your daily goal in minutes
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}/>

                            <FormField control={form.control} name="monthlyGoal" render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-white">Monthly Goal</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Monthly Goal" type="number" {...field} onChange={(event) => field.onChange(Number(event.target.value))} className="w-80"/>
                                    </FormControl>
                                    <FormDescription>
                                        Enter your monthly goal in hours
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}/>

                            <FormField control={form.control} name="interests" render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-white">Interests</FormLabel>
                                    <FormControl>
                                        <TagsInput value={field.value == null ? [""] : field.value} onValueChange={field.onChange}
                                                   placeholder="Interests" className="w-80"/>
                                    </FormControl>
                                    <FormDescription>
                                        Enter your interests
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}/>

                            <Button type="submit">SAVE CHANGES</Button>
                        </form>
                    </Form>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}