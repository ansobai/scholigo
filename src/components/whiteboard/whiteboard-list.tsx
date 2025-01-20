'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {Copy, Delete, DoorOpen, MoreHorizontal, Share2, UserCog, X} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {
    deleteWhiteboard,
    getWhiteboardCollaborators, removeSelfFromWhiteboard,
    removeUserFromWhiteboard
} from "@/app/dashboard/whiteboard/actions/whiteboard";
import {toast} from "@/hooks/use-toast";
import {Whiteboard, WhiteboardCollaborator, WhiteboardShare} from "@/types/whiteboard";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {useEffect, useState} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import {generateSharingCode, getSharingInfo, refreshSharingCode} from "@/app/dashboard/whiteboard/actions/sharing";
import {Input} from "@/components/ui/input";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

interface WhiteboardListProps {
    initWhiteboards: Whiteboard[],
    userId: string
}

export function WhiteboardList({ initWhiteboards, userId }: WhiteboardListProps) {
    if (initWhiteboards.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-xl text-lightYellow mb-4">No active whiteboards found.</p>
                <p className="text-white">Click the &quot;Create New Whiteboard&quot; button to get started!</p>
            </div>
        )
    }

    const [whiteboards, setWhiteboards] = useState(initWhiteboards)

    const handleDelete = async (whiteboard: Whiteboard) => {
        setWhiteboards(whiteboards.filter((wb) => wb.id !== whiteboard.id))

        const result = await deleteWhiteboard(whiteboard.id)
        if (result.status === "success") {
            toast({
                title: "Whiteboard deleted",
                description: "Whiteboard has been successfully deleted.",
                variant: "success"
            })
        } else {
            toast({
                title: "Error deleting whiteboard",
                description: "Failed to delete whiteboard. Please try again later.",
                variant: "destructive"
            })
            setWhiteboards((currentWhiteboards) => [...currentWhiteboards, whiteboard])
        }
    }

    const handleLeave = (id: string) => {
        setWhiteboards(whiteboards.filter((wb) => wb.id !== id))
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {whiteboards.map((whiteboard) => (
                <WhiteboardCard key={whiteboard.id} whiteboard={whiteboard} handleDelete={handleDelete} isOwner={whiteboard.created_by == userId} handleLeave={handleLeave} />
            ))}
        </div>
    )
}

interface WhiteboardCardProps {
    whiteboard: Whiteboard,
    isOwner: boolean,
    handleDelete: (whiteboard: Whiteboard) => void,
    handleLeave: (id: string) => void
}

function WhiteboardCard({ whiteboard, isOwner, handleDelete, handleLeave }: WhiteboardCardProps) {
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
    const [isUserManageOpen, setIsUserManageOpen] = useState(false)
    const [sharingInfo, setSharingInfo] = useState<WhiteboardShare | null>(null)
    const [members, setMembers] = useState<WhiteboardCollaborator[] | null>(null)
    const [isPermanent, setIsPermanent] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false)


    const fetchSharingInfo = async () => {
        const result = await getSharingInfo(whiteboard.id)

        if (result) {
            setSharingInfo(result)
        }
    }

    const fetchMembers = async () => {
        const result = await getWhiteboardCollaborators(whiteboard.id)

        if (result.status == 'success') {
            setMembers(result.collaborators)
        }
    }

    useEffect(() => {
        if (isShareDialogOpen) {
            fetchSharingInfo()
        }
    }, [whiteboard.id, isShareDialogOpen]);

    useEffect(() => {
        if (isUserManageOpen) {
            fetchMembers()
        }
    }, [whiteboard.id, isUserManageOpen]);

    const handleGenerateCode = async () => {
        setIsLoading(true)
        const info = await generateSharingCode(whiteboard.id, isPermanent)
        setSharingInfo(info)
        setIsLoading(false)
    }

    const handleRefreshCode = async () => {
        setIsLoading(true)
        const info = await refreshSharingCode(whiteboard.id, isPermanent)
        setSharingInfo(info)
        setIsLoading(false)
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/whiteboard/${whiteboard.id}/invite?token=${sharingInfo!.token}`).then(() => {
            toast({
                title: "Copied!",
                description: "Link copied to clipboard",
            })
        }, (err) => {
            console.error('Could not copy text: ', err)
            toast({
                title: "Error",
                description: "Failed to copy link",
                variant: "destructive",
            })
        })
    }

    const removeMember = async (member: WhiteboardCollaborator) => {
        const result = await removeUserFromWhiteboard(whiteboard.id, member.user_id)

        if (result.status == "success") {
            toast({
                title: "Removed",
                description: "User has been removed from whiteboard",
                variant: "success"
            })
            setMembers((currentMembers) => currentMembers!.filter((m) => m.user_id !== member.user_id))
        } else {
            toast({
                title: "Error",
                description: "Failed to remove user from whiteboard",
                variant: "destructive"
            })
        }
    }

    const removeSelf = async () => {
        const result = await removeSelfFromWhiteboard(whiteboard.id)

        if (result.status == "error") {
            toast({
                title: "Error deleting whiteboard",
                description: "Failed to delete whiteboard. Please try again later.",
                variant: "destructive"
            })
        } else {
            handleLeave(whiteboard.id)
            toast({
                title: "Left Whiteboard",
                description: `You have left the whiteboard ${whiteboard.name}`,
                variant: "success"
            })
        }
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row justify-between mb-2">
                    <div>
                        <CardTitle className="text-lightYellow">{whiteboard.name}</CardTitle>
                        <CardDescription>Created on {new Date(whiteboard.created_at).toLocaleDateString()}</CardDescription>
                    </div>
                    {isOwner ? (
                        <div className="flex items-center space-x-2">
                            <div className="hidden md:flex space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => setIsUserManageOpen(true)}>
                                    <UserCog className="h-4 w-4"/>
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setIsShareDialogOpen(true)}>
                                    <Share2 className="h-4 w-4"/>
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setIsDeleteAlertOpen(true)}>
                                    <Delete className="h-4 w-4"/>
                                </Button>
                            </div>
                            <div className="md:hidden">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4"/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setIsUserManageOpen(true)}>
                                            Manage Whiteboard
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setIsShareDialogOpen(true)}>
                                            Share Whiteboard
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setIsDeleteAlertOpen(true)}>
                                            Delete Whiteboard
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 hover:text-red-500"
                            onClick={removeSelf}
                        >
                            <DoorOpen className="h-5 w-5" />
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href={`/dashboard/whiteboard/${whiteboard.id}`}>Join Whiteboard</Link>
                    </Button>
                </CardContent>
            </Card>

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this whiteboard?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the whiteboard and all its
                            content
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(whiteboard)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogContent className="w-fit">
                    <DialogHeader>
                        <DialogTitle>Share Whiteboard</DialogTitle>
                        <DialogDescription>{whiteboard.name}'s Share Settings</DialogDescription>
                    </DialogHeader>
                    <DialogDescription>
                        <div className="flex items-center space-x-2 mb-5">
                            <Switch id="perm-invite" checked={isPermanent} onCheckedChange={setIsPermanent} />
                            <Label htmlFor="perm-invite">Permanent Invite</Label>
                        </div>
                        {sharingInfo && (
                            <div className="space-y-2">
                                <div className="flex relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                                    <Input
                                        value={`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/whiteboard/${whiteboard.id}/invite?token=${sharingInfo.token}`}
                                        readOnly
                                        className="pr-10"
                                    />
                                    <Button
                                        variant="ghost"
                                        onClick={copyToClipboard}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        <Copy className="h-4 w-4"/>
                                    </Button>
                                </div>
                                <p>
                                    {sharingInfo.is_permanent
                                        ? 'This is a permanent link'
                                        : `Expires at: ${sharingInfo.expires_at?.toLocaleString()}`}
                                </p>
                                <Button onClick={handleRefreshCode}
                                        disabled={isLoading}>{isLoading ? "Refreshing..." : "Refresh Code"}</Button>
                            </div>
                        )}
                        {!sharingInfo && (
                            <Button onClick={handleGenerateCode} disabled={isLoading}>{isLoading ? "Generating..." : "Generate Sharing Code"}</Button>
                        )}
                    </DialogDescription>
                </DialogContent>
            </Dialog>

            <Dialog open={isUserManageOpen} onOpenChange={setIsUserManageOpen}>
                <DialogContent className="w-fit min-w-[15%]">
                    <DialogHeader>
                        <DialogTitle>Manage Whiteboard</DialogTitle>
                        <DialogDescription>{whiteboard.name}'s User Management</DialogDescription>
                    </DialogHeader>
                    <DialogDescription>
                        <ScrollArea>
                            { members && members.length != 0 ? members.map((member) => (
                                <div key={member.name} className="group flex justify-between items-center rounded-lg p-3 shadow-sm transition-all hover:shadow-md gap-4">
                                    <div className="flex gap-2 items-center">
                                        <Avatar className="h-10 w-10 rounded-full">
                                            <AvatarImage src={member.avatar_url} alt={member.name} />
                                            <AvatarFallback className="rounded-full">{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>

                                        <div className="flex flex-col">
                                            <p className="font-medium text-base text-foreground">{member.name}</p>
                                            <p className="text-sm text-muted-foreground">Last Access: {new Date(member.last_access).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeMember(member)}
                                    >
                                        <X className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                                        <span className="sr-only">Remove {member.name}</span>
                                    </Button>
                                </div>
                            )) : (
                                <p>No collaborators found</p>
                            )}
                        </ScrollArea>
                    </DialogDescription>
                </DialogContent>
            </Dialog>
        </>
    )
}

