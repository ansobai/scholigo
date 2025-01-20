import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {cookies} from "next/headers";
import {ThemeProvider} from "@/components/theme-provider";
import {BellIcon} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import {getUser} from "@/utils/user";
import {UserProvider} from "@/components/user-provider";
import {Suspense} from "react";
import DashboardSidebar from "@/components/ui/dashboard-sidebar";
import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "Scholigo Dashboard",
    description: "A platform for learning and teaching",
};

export default async function DashboardLayout({ children } : { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark">
            <Suspense>
                <DashboardContent>
                    {children}
                </DashboardContent>
            </Suspense>
        </ThemeProvider>
    )
}

export async function DashboardContent({ children } : { children: React.ReactNode }) {
    const cookie = await cookies()
    const defaultOpen = cookie.get('sidebar:state')?.value === 'true'
    const user = await getUser()

    return (
        <UserProvider user={user}>
            <SidebarProvider defaultOpen={defaultOpen}>
                <DashboardSidebar />
                <main className="flex flex-col w-full h-screen overflow-y-auto">
                    <div className="bg-darkBlue justify-between p-2 flex flex-row">
                        <SidebarTrigger />
                        <div className="flex flex-row gap-3 mr-4">
                            <BellIcon />
                        </div>
                    </div>
                    {children}
                </main>
                <Toaster />
            </SidebarProvider>
        </UserProvider>
    )
}