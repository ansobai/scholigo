'use client'

import {useCallback, useEffect, useState, useTransition} from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Permission } from '@/types/communities/permissions'
import { toast } from '@/hooks/use-toast'
import {usePermissions} from "@/hooks/use-permissions";
import {useDebouncedCallback} from "use-debounce";
import {searchMembers, updateMemberRoles} from "@/app/dashboard/communities/actions/members";
import {Member, Role} from "@/types/communities/communities";
import {getRoles} from "@/app/dashboard/communities/actions/permissions";
import {useCommunity} from "@/components/communities/community-provider";

const searchSchema = z.object({
    query: z.string(),
})

/**
 * Component for managing members in a community.
 *
 * @returns {JSX.Element} The rendered MembersManagementTab component.
 */
export default function MembersManagementTab() {
    const [members, setMembers] = useState<Member[]>([])
    const [init, setInit] = useState(false)
    const [roles, setRoles] = useState<Role[]>([])
    const community = useCommunity()
    const [isPending, startTransition] = useTransition()
    const { checkPermission } = usePermissions()

    if (!community) {
        return <div>Community not found</div>
    }

    /**
     * Fetches the roles for the community.
     */
    const fetchRoles = useCallback(async () => {
        if (!community) return

        const roles = await getRoles(community.id)

        setRoles(roles)
        setInit(true)
    }, [community])

    useEffect(() => {
        fetchRoles()
    }, [fetchRoles])

    const form = useForm<z.infer<typeof searchSchema>>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            query: '',
        },
    })

    const debouncedSearch = useDebouncedCallback(async (query: string) => {
        if (!query) {
            setMembers([])
            return
        }

        try {
            const results = await searchMembers(community.id, query)

            setMembers(results as Member[])
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to search members',
                variant: 'destructive',
            })
        }
    }, 300)

    /**
     * Handles the form submission for searching members.
     *
     * @param {z.infer<typeof searchSchema>} data - The data from the form.
     */
    const onSubmit = (data: z.infer<typeof searchSchema>) => {
        startTransition(() => {
            debouncedSearch(data.query)
        })
    }

    /**
     * Handles the role change for a member.
     *
     * @param {string} memberId - The ID of the member.
     * @param {string[]} roleIds - The IDs of the roles.
     */
    const handleRoleChange = async (memberId: string, roleIds: string[]) => {
        startTransition(async () => {
            try {
                await updateMemberRoles(
                    memberId,
                    community.id,
                    roleIds.map(id => parseInt(id))
                )

                // Optimistically update the UI
                setMembers(members.map(member => {
                    if (member.id === memberId) {
                        return {
                            ...member,
                            user_roles: roleIds.map(id => ({
                                role_id: parseInt(id),
                                roles: roles.find(r => r.id === parseInt(id))!
                            }))
                        }
                    }
                    return member
                }))

                toast({
                    title: 'Roles updated successfully',
                    variant: 'success',
                })
            } catch (error) {
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'Failed to update roles',
                    variant: 'destructive',
                })
            }
        })
    }

    if (!checkPermission(Permission.MANAGE_MEMBERS)) {
        return <div>You don't have permission to manage members.</div>
    }

    return (
        <div className="space-y-6">
            <Form {...form}>
                <form
                    onChange={form.handleSubmit(onSubmit)}
                    className="flex space-x-2"
                >
                    <FormField
                        control={form.control}
                        name="query"
                        render={({ field }) => (
                            <FormItem className="flex-grow">
                                <FormControl>
                                    <Input
                                        placeholder="Search members..."
                                        {...field}
                                        className="bg-background"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </form>
            </Form>

            <ScrollArea className="h-[500px] rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={member.avatar_url || ''} />
                                        <AvatarFallback>
                                            {member.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span>{member.name}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {member.user_roles.map(({ roles }) => (
                                            <Badge
                                                key={roles.name}
                                                style={{
                                                    backgroundColor: roles.color,
                                                    color: 'white',
                                                }}
                                            >
                                                {roles.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {new Date(member.community_members.joined_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Select
                                        onValueChange={(value) => {
                                            const currentRoles = member.user_roles.map(r => r.role_id.toString())
                                            const newRoles = currentRoles.includes(value)
                                                ? currentRoles.filter(r => r !== value)
                                                : [...currentRoles, value]
                                            handleRoleChange(member.id, newRoles)
                                        }}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Modify roles" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem
                                                    key={role.id}
                                                    value={role.id.toString()}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-2 h-2 rounded-full"
                                                            style={{ backgroundColor: role.color }}
                                                        />
                                                        <span>{role.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollArea>
        </div>
    )
}