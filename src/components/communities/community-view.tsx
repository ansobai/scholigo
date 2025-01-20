"use client";

import { Permission } from "@/types/communities/permissions";
import { usePermissions } from "@/hooks/use-permissions";
import { useEffect } from "react";
import {LogOut, Settings, Users} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {useRouter}from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {leaveCommunity} from "@/app/dashboard/communities/actions/communities";
import {toast} from "@/hooks/use-toast";
import {useCommunity} from "@/components/communities/community-provider";
import ErrorComponent from "@/components/error-component";
import {CommunityPosts} from "@/components/communities/community-posts";
import {Post} from "@/types/communities/communities";
import CommunitySettingsSheet from "@/components/communities/(settings)/community-settings-sheet";

interface CommunityViewProps {
    initPosts?: Post[];
}

/**
 * Component for displaying the community view.
 *
 * @param {CommunityViewProps} props - The properties for the component.
 * @param {Post[]} [props.initPosts] - The initial list of posts.
 * @returns {JSX.Element} The rendered CommunityView component.
 */
export default function CommunityView({ initPosts }: CommunityViewProps) {
    const community = useCommunity()
    const router = useRouter()

    if (!community) {
        return <ErrorComponent error="Failed to load community!" returnTo="/dashboard/communities" />
    }

    /**
     * Handles the action of leaving the community.
     */
    const handleLeave = async () => {
        const result = await leaveCommunity(community.id);

        if (!result || result.status === "error") {
            toast({
                title: "Error leaving community",
                description: result.error,
                variant: "destructive",
            })
        }

        router.push("/communities");
    }

    return (
        <div className="container mx-auto px-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-lightYellow scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                        {community.name}
                    </h1>
                    <p className="leading-7 [&:not(:first-child)]:mt-6">
                        {community.description}
                    </p>
                    <p className="mb-2">
                        <Users className="inline mr-1" size={16} />
                        {community.members_count} members{" "}
                        {community.university && `| ${community.university}`}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {community.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <CommunitySettingsSheet />

                    {!community.isOwner && (
                        <AlertDialog>
                            <AlertDialogTrigger>
                                
                                    <LogOut />
                                
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to leave this community?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You can always rejoin the community later.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleLeave}>Leave</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            <div className="my-4">
                <CommunityPosts initPosts={initPosts} />
            </div>
        </div>
    );
}