'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, LogOut, University, Trash2 } from "lucide-react";
import { UserCommunities } from "@/types/communities/communities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {deleteCommunity, joinCommunity, leaveCommunity} from "@/app/dashboard/communities/actions/communities";
import {useRouter} from "next/navigation";
import {toast} from "@/hooks/use-toast";
import Link from "next/link";

interface CommunityCardProps {
  community: UserCommunities;
}

/**
 * Component for displaying a community card with information and actions.
 *
 * @param {CommunityCardProps} props - The properties for the component.
 * @param {UserCommunities} props.community - The community data to display.
 * @returns {JSX.Element} The rendered CommunityCard component.
 */
export function CommunityCard({
                                community,
                              }: CommunityCardProps) {
  const router = useRouter();

  /**
   * Handles the join/leave action for the community.
   */
  const handleJoinLeave = async () => {
    if (community.isMember) {
      // Leave community
      const result = await leaveCommunity(community.id);

      if (!result || result.status === "error") {
        toast({
          title: "Error leaving community",
          description: result.error,
          variant: "destructive",
        })
      }

      router.refresh()
    } else {
      // Join community
      const result = await joinCommunity(community.id);

      if (!result || result.status === "error") {
        toast({
          title: "Error joining community",
          description: result.error,
          variant: "destructive",
        })
      }

      router.refresh()
    }
  };

  return (
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center text-lightYellow">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={community.icon} alt={community.name} />
                <AvatarFallback className="rounded-lg">
                  {community.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {community.name}
            </div>

            {(community.isMember && !community.isOwner) && (
                <AlertDialog>
                  <AlertDialogTrigger>
                      <LogOut className="text-red-500" />
                  
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
                      <AlertDialogAction onClick={handleJoinLeave}>Leave</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            )}
          </CardTitle>
          <CardDescription className="flex flex-col items-start mb-4">
            {community.members_count && (
                <p className="text-sm mr-4">
                  <Users className="inline mr-1" size={16} />
                  {community.members_count} members
                </p>
            )}
            {community.university && (
                <p className="text-sm">
                  <University className="inline mr-1" size={16} />
                  {community.university}
                </p>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm mb-2">{community.description}</p>
          <div className="flex flex-wrap gap-1">
            {community.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
            ))}
          </div>
        </CardContent>
        {!community.isMember ? (
            <div className="px-6 mt-auto pb-2">
              <Button className="w-full" variant="default" onClick={handleJoinLeave}>
                Join
              </Button>
            </div>
        ) : (
            <div className="px-6 mt-auto pb-2">
              <Link href={`/dashboard/communities/${community.id}`}>
                <Button className="w-full" variant="default">
                  Go to community
                </Button>
              </Link>
            </div>
        )}
      </Card>
  );
}