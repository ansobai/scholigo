'use client'

import {usePermissions} from "@/hooks/use-permissions";
import {useState} from "react";
import {Permission} from "@/types/communities/permissions";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";
import {Settings} from "lucide-react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import CommunitySettingsTab from "@/components/communities/(settings)/community-settings-tab";
import RolesManagementTab from "@/components/communities/(settings)/roles-management-tab";
import MembersManagementTab from "@/components/communities/(settings)/members-management-tab";

/**
 * Component for displaying the community settings sheet.
 *
 * @returns {JSX.Element | null} The rendered CommunitySettingsSheet component or null if the user does not have permission to view settings.
 */
export default function CommunitySettingsSheet() {
    const [open, setOpen] = useState(false)
    const { checkPermission } = usePermissions()

    if (!checkPermission(Permission.VIEW_SETTINGS)) {
        return null
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Settings className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Open community settings</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[700px] overflow-y-scroll">
                <SheetHeader>
                    <SheetTitle>Community Settings</SheetTitle>
                </SheetHeader>
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="roles">Roles</TabsTrigger>
                        <TabsTrigger value="members">Members</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general">
                        <CommunitySettingsTab />
                    </TabsContent>
                    <TabsContent value="roles">
                        <RolesManagementTab />
                    </TabsContent>
                    <TabsContent value="members">
                        <MembersManagementTab />
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    )
}