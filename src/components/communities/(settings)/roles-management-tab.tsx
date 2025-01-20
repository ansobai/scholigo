'use client'

import {useCallback, useEffect, useState, useTransition} from 'react'
import {SubmitHandler, useForm} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Plus, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Permission } from '@/types/communities/permissions'
import { toast } from '@/hooks/use-toast'
import { Role, roleSchema } from "@/types/communities/communities";
import {usePermissions} from "@/hooks/use-permissions";
import {createRole, deleteRole, getRoles, updateRole} from "@/app/dashboard/communities/actions/permissions";
import {useCommunity}from "@/components/communities/community-provider";

const PREDEFINED_COLORS = [
    '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#e91e63',
    '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#607d8b',
    '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548',
]

/**
 * Component for managing roles in a community.
 *
 * @returns {JSX.Element} The rendered RolesManagementTab component.
 */
export default function RolesManagementTab() {
    const community = useCommunity()

    if (!community) {
        return <div>Failed to load community</div>
    }

    const [init, setInit] = useState(false)
    const [roles, setRoles] = useState<Role[]>([])
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [isPending, startTransition] = useTransition()
    const { checkPermission } = usePermissions()

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

    const form = useForm<z.infer<typeof roleSchema>>({
        resolver: zodResolver(roleSchema),
        defaultValues: selectedRole || {
            name: '',
            color: PREDEFINED_COLORS[0],
            permissions: 0,
            community_id: community.id,
        },
    })

    /**
     * Handles the creation of a new role.
     */
    const handleCreateRole = () => {
        setSelectedRole(null)
        form.reset({
            name: '',
            color: PREDEFINED_COLORS[0],
            permissions: 0,
        })
    }

    /**
     * Handles the selection of an existing role.
     *
     * @param {Role} role - The role to select.
     */
    const handleSelectRole = (role: Role) => {
        setSelectedRole(role)
        form.reset({
            name: role.name,
            color: role.color,
            permissions: role.permissions,
        })
    }

    /**
     * Handles the change of permissions for a role.
     *
     * @param {Permission} permission - The permission to change.
     */
    const handlePermissionChange = (permission: Permission) => {
        const currentPermissions = form.getValues('permissions')
        const newPermissions = currentPermissions & permission
            ? currentPermissions & ~permission
            : currentPermissions | permission

        form.setValue('permissions', newPermissions)
        setHasUnsavedChanges(true)
    }

    /**
     * Handles the form submission for creating or updating a role.
     *
     * @param {z.infer<typeof roleSchema>} data - The data from the form.
     */
    const onSubmit: SubmitHandler<z.infer<typeof roleSchema>> = async (data) => {
        startTransition(async () => {
            if (selectedRole) {
                const result = await updateRole(selectedRole.id, { ...data, community_id: community.id })

                if (!result.success) {
                    toast({
                        title: 'Error',
                        description: 'Failed to update role',
                        variant: 'destructive',
                    })
                    return
                }

                setRoles(roles.map(r =>
                    r.id === selectedRole.id ? { ...r, ...data } : r
                ))
            } else {
                const result = await createRole({ ...data, community_id: community.id })

                if (!result.success) {
                    toast({
                        title: 'Error',
                        description: 'Failed to create role',
                        variant: 'destructive',
                    })
                    return
                }

                const newRole = { id: result.id, ...data, community_id: community.id }
                setRoles([...roles, newRole])
                setSelectedRole(newRole)
            }

            setHasUnsavedChanges(false)
            toast({
                title: `Role ${selectedRole ? 'updated' : 'created'} successfully`,
                variant: 'success',
            })
        })
    }

    /**
     * Handles the reset of the form to its initial state.
     */
    const handleReset = () => {
        if (selectedRole) {
            form.reset({
                name: selectedRole.name,
                color: selectedRole.color,
                permissions: selectedRole.permissions,
            })
        } else {
            form.reset({
                name: '',
                color: PREDEFINED_COLORS[0],
                permissions: 0,
            })
        }
        setHasUnsavedChanges(false)
    }

    /**
     * Handles the deletion of a role.
     */
    const handleDelete = async () => {
        if (!selectedRole) return

        startTransition(async () => {
            try {
                await deleteRole(selectedRole.id)
                setRoles(roles.filter(r => r.id !== selectedRole.id))
                setSelectedRole(null)
                form.reset({
                    name: '',
                    color: PREDEFINED_COLORS[0],
                    permissions: 0,
                })
                toast({
                    title: 'Role deleted successfully',
                    variant: 'success',
                })
            } catch (error) {
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'Something went wrong',
                    variant: 'destructive',
                })
            }
        })
    }

    if (!checkPermission(Permission.MANAGE_MEMBERS)) {
        return <div>You don't have permission to manage roles.</div>
    }

    return (
        <div className="flex h-[600px] gap-4">
            <div className="w-64 bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Roles</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCreateRole}
                        disabled={roles.length >= 15}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <ScrollArea className="h-[calc(100%-2rem)]">
                    <div className="space-y-1">
                        {!init && (
                            <div className="text-sm text-slate-500">Loading roles...</div>
                        )}
                        {init && roles.length === 0 && (
                            <div className="text-sm text-slate-500">No roles found</div>
                        )}
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => handleSelectRole(role)}
                                className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm",
                                    selectedRole?.id === role.id
                                        ? "bg-accent"
                                        : "hover:bg-accent/50"
                                )}
                            >
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: role.color }}
                                />
                                <span>{role.name}</span>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Right panel - Role editor */}
            <div className="flex-1 rounded-lg p-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <input type="hidden" {...form.register('community_id')} />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e)
                                                setHasUnsavedChanges(true)
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role Color</FormLabel>
                                    <div className="grid grid-cols-10 gap-2">
                                        {PREDEFINED_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={cn(
                                                    "w-8 h-8 rounded-md",
                                                    field.value === color && "ring-2 ring-ring ring-offset-2"
                                                )}
                                                style={{ backgroundColor: color }}
                                                onClick={() => {
                                                    field.onChange(color)
                                                    setHasUnsavedChanges(true)
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium">Permissions</h4>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        form.setValue('permissions', 0)
                                        setHasUnsavedChanges(true)
                                    }}
                                >
                                    Clear permissions
                                </Button>
                            </div>

                            <ScrollArea className="h-[500px] pr-4">
                                <div className="space-y-2">
                                    <FormField
                                        control={form.control}
                                        name="permissions"
                                        render={({ field }) => (
                                            <FormItem>
                                                {Object.entries(Permission)
                                                    .filter(([key, value]) => typeof value === 'number')
                                                    .map(([key, value]) => (
                                                        <div
                                                            key={key}
                                                            className="flex items-center justify-between rounded-lg border p-4"
                                                        >
                                                            <div className="space-y-0.5">
                                                                <div className="text-sm font-medium">
                                                                    {key.split('_').map(word =>
                                                                        word.charAt(0) + word.slice(1).toLowerCase()
                                                                    ).join(' ')}
                                                                </div>
                                                            </div>
                                                            <Switch
                                                                {...form.register('permissions')}
                                                                checked={(form.getValues('permissions') & (value as number)) === value}
                                                                onCheckedChange={() => handlePermissionChange((value as number))}
                                                            />
                                                        </div>
                                                    ))}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </ScrollArea>
                        </div>
                    </form>
                </Form>

                {selectedRole && (
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending}
                        className="w-full mt-4"
                    >
                        Delete Role
                    </Button>
                )}
            </div>

            {hasUnsavedChanges && (
                <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-background text-foreground px-4 py-2 rounded-lg shadow-lg">
                    <span>Careful — you have unsaved changes!</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        disabled={isPending}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isPending}
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}