"use client"

import {
    Check,
    ChevronsUpDown, Copy,
    LogOut, User,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import {signout} from "@/app/auth/actions";
import Link from "next/link";
import {useCallback, useEffect, useState} from "react";
import {getUserProfile} from "@/utils/profile";
import {Profile} from "@/types/profile";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";

export function SidebarUser({ id }: { id: string }) {
    const { isMobile } = useSidebar()
    const [profile, setProfile] = useState<Profile | null>(null)

    const fetchUserProfile = useCallback(async () => {
        const userProfile = await getUserProfile(id);
        setProfile(userProfile);
    }, [id]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    if (!profile) {
        return <SidebarUserSkeleton />;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={profile.avatar_url} alt={profile.name} />
                                <AvatarFallback className="rounded-lg">{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-left text-sm leading-tight truncate font-semibold">{profile.name}</span>
                            <ChevronsUpDown className="ml-auto size-4"/>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-3 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg place-self-start mt-1">
                                    <AvatarImage src={profile.avatar_url} alt={profile.name} />
                                    <AvatarFallback className="rounded-lg">{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{profile.name}</span>
                                    <UserCopyId userId={profile.id}/>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href={`/dashboard/profile/${profile.id}`}>
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                        <User />
                                        Profile
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signout()}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

export function UserCopyId({ userId }: { userId: string }) {
    const [isHovered, setIsHovered] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => setIsCopied(false), 2000)
            return () => clearTimeout(timer)
        }
    }, [isCopied])

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(userId)
            setIsCopied(true)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild className="relative w-48 h-8 overflow-hidden cursor-pointer" onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                                onClick={copyToClipboard}>
                    <div>
                        <div
                            className={`absolute inset-0 flex items-center justify-start transition-transform duration-300 ${isHovered ? '-translate-y-full' : ''}`}>
                            <span className="text-[#FFC300] font-semibold">User ID</span>
                        </div>
                        <div
                            className={`absolute inset-0 flex items-center justify-between pr-4 transition-transform duration-300 ${isHovered ? '' : 'translate-y-full'}`}>
                            <span className="text-[#FFD60A] font-mono">{userId}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#FFD60A]">
                                {isCopied ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}
                            </Button>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    <p>{isCopied ? 'Copied!' : 'Click to copy'}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

export function SidebarUserSkeleton() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground relative overflow-hidden"
                >
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#003566] to-[#001D3D] animate-pulse">
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC300] to-transparent skeleton-shimmer" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight gap-1">
                        <div className="h-4 w-24 bg-gradient-to-r from-[#003566] to-[#001D3D] rounded animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFC300] to-transparent skeleton-shimmer" />
                        </div>
                        <div className="h-3 w-20 bg-gradient-to-r from-[#003566] to-[#001D3D] rounded animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD60A] to-transparent skeleton-shimmer" />
                        </div>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 text-[#FFC300] animate-bounce" />
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
