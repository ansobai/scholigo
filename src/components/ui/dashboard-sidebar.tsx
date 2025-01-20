'use client';

import {
    Sidebar,
    SidebarContent, SidebarFooter,
    SidebarGroup, SidebarGroupLabel,
    SidebarHeader, SidebarMenuButton,
    SidebarMenuItem, SidebarSeparator, useSidebar
} from "@/components/ui/sidebar";
import Image from "next/image";
import logo from '@public/logo.png';
import {
    ChartPieIcon,
    CircleHelpIcon,
    ClockIcon,
    FlameIcon,
    HomeIcon,
    ListTodoIcon, Presentation,
    SettingsIcon,
    UsersIcon
} from "lucide-react";
import {usePathname} from "next/navigation";
import Link from "next/link";
import {clsx} from "clsx";
import {SidebarUser, SidebarUserSkeleton} from "@/components/ui/sidebar-user";
import {Suspense} from "react";
import {useUser} from "@/components/user-provider";

const sidebarMainItems = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: HomeIcon,
    },
    {
        name: 'Pomodoro',
        href: '/dashboard/pomodoro',
        icon: ClockIcon,
    },
    {
        name: 'Todo',
        href: '/dashboard/todo',
        icon: ListTodoIcon,
    },
    {
        name: 'Whiteboard',
        href: '/dashboard/whiteboard',
        icon: Presentation,
        child: true
    },
    {
        name: 'Leaderboard',
        href: '/dashboard/leaderboard',
        icon: FlameIcon,
    },
    {
        name: 'Communities',
        href: '/dashboard/communities',
        icon: UsersIcon,
        child: true
    },
]

const sidebarSecondaryItems = [
    {
        name: 'Help Center',
        href: '/dashboard/help',
        icon: CircleHelpIcon ,
    },
]

export default function DashboardSidebar() {
    const user = useUser();
    const pathname = usePathname();
    const { state } = useSidebar();

    return (
        <Sidebar collapsible="icon" className="border-darkBlue">
            <SidebarHeader>
                <div className="flex flex-row gap-1">
                    <Image src={logo} alt="Scholigo Logo" width={48} height={42} />
                    <h1 className={clsx(
                        "text-4xl font-extrabold tracking-tight text-lightYellow",
                        state === 'collapsed' && 'hidden'
                    )}>Scholigo</h1>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    {sidebarMainItems.map((item) => (
                        <SidebarMenuItem key={item.name} className="list-none mb-2">
                            <SidebarMenuButton asChild isActive={item.child ? pathname.startsWith(item.href) : item.href == pathname}>
                                <Link href={item.href}>
                                    <item.icon />
                                    <span>{item.name}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupLabel>OTHERS</SidebarGroupLabel>
                    {sidebarSecondaryItems.map((item) => (
                        <SidebarMenuItem key={item.name} className="list-none mb-2">
                            <SidebarMenuButton asChild isActive={item.href == pathname}>
                                <a href={item.href}>
                                    <item.icon />
                                    <span>{item.name}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarGroup>
            </SidebarContent>

            {user ? (
                <SidebarFooter>
                    <Suspense fallback={<SidebarUserSkeleton />}>
                        <SidebarUser id={user.id} />
                    </Suspense>
                </SidebarFooter>
            ): null}
        </Sidebar>
    )
}