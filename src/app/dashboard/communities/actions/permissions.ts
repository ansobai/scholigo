'use server'

import {createClient} from "@/utils/supabase/server";
import {getUserCommunityPermissions, invalidateCommunityPermissions} from "@/utils/community/roles";
import {revalidatePath} from "next/cache";
import z from "zod"
import {Role, roleSchema} from "@/types/communities/communities";
import {hasPermission, Permission} from "@/types/communities/permissions";
import {createAdminClient} from "@/utils/supabase/admin";

/**
 * Retrieves the permissions of the current user for a specific community.
 *
 * @param {string} communityId - The ID of the community.
 * @returns {Promise<number>} A promise that resolves to the user's permissions.
 */
export async function getUserPermissions(communityId: string): Promise<number> {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        console.error('getUserPermissions Error:', error)
        return 0
    }

    return await getUserCommunityPermissions(user.id, communityId)
}

/**
 * Creates a new role in a community.
 *
 * @param {z.infer<typeof roleSchema>} data - The role data to create.
 * @returns {Promise<{ success: boolean, id?: number }>} A promise that resolves to an object indicating success and the role ID if successful.
 */
export async function createRole(data: z.infer<typeof roleSchema>) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        console.error('createRole Error:', error)
        return { success: false }
    }

    const userPermissions = await getUserCommunityPermissions(user.id, data.community_id)

    if (!userPermissions || !hasPermission(userPermissions, Permission.MANAGE_ROLES)) {
        console.error('createRole Error: User has no permissions')
        return { success: false }
    }

    const adminClient = createAdminClient()
    const { data: rowData, error: createRoleError } = await adminClient
        .from('roles')
        .insert({
            name: data.name,
            color: data.color,
            permissions: data.permissions,
            community_id: data.community_id
        }).select()

    if (createRoleError || !data) {
        console.error('createRole Error:', createRoleError)
        return { success: false }
    }

    return { success: true, id: rowData[0].id }
}

/**
 * Updates an existing role in a community.
 *
 * @param {number} id - The ID of the role to update.
 * @param {z.infer<typeof roleSchema>} data - The updated role data.
 * @returns {Promise<{ success: boolean }>} A promise that resolves to an object indicating success.
 */
export async function updateRole(
    id: number,
    data: z.infer<typeof roleSchema>
) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        console.error('updateRole Error:', error)
        return { success: false }
    }

    const userPermissions = await getUserCommunityPermissions(user.id, data.community_id)

    if (!userPermissions || !hasPermission(userPermissions, Permission.MANAGE_ROLES)) {
        console.error('updateRole Error: User has no permissions')
        return { success: false }
    }

    const adminClient = createAdminClient()
    const { error: updateRoleError } = await adminClient
        .from('roles')
        .update({
            name: data.name,
            color: data.color,
            permissions: data.permissions
        })
        .eq('id', id)
        .eq('community_id', data.community_id)

    if (updateRoleError) {
        console.error('updateRole Error:', updateRoleError)
        return { success: false}
    }

    invalidateCommunityPermissions(data.community_id)

    return { success: true }
}

/**
 * Deletes a role from a community.
 *
 * @param {number} id - The ID of the role to delete.
 * @returns {Promise<{ success: boolean }>} A promise that resolves to an object indicating success.
 */
export async function deleteRole(id: number) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        console.error('deleteRole Error:', error)
        return { success: false }
    }

    const adminClient = createAdminClient()

    const { data: roleData, error: roleError } = await adminClient
        .from('roles')
        .select('community_id')
        .eq('id', id)

    if (roleError || !roleData) {
        console.error('deleteRole Error:', roleError)
        return { success: false }
    }

    const userPermissions = await getUserCommunityPermissions(user.id, roleData[0].community_id)

    if (!userPermissions || !hasPermission(userPermissions, Permission.MANAGE_ROLES)) {
        console.error('deleteRole Error: User has no permissions')
        return { success: false }
    }

    const { error: deleteRoleError } = await adminClient
        .from('roles')
        .delete()
        .eq('id', id)

    if (deleteRoleError) {
        console.error('deleteRole Error:', deleteRoleError)
        return { success: false}
    }

    invalidateCommunityPermissions(roleData[0].community_id)

    return { success: true }
}

/**
 * Retrieves all roles for a specific community.
 *
 * @param {string} communityId - The ID of the community.
 * @returns {Promise<Role[]>} A promise that resolves to an array of roles.
 */
export async function getRoles(communityId: string): Promise<Role[]> {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        console.error('getRoles Error:', error)
        return []
    }

    const userPermissions = await getUserCommunityPermissions(user.id, communityId)

    if (!userPermissions || !hasPermission(userPermissions, Permission.MANAGE_ROLES)) {
        console.error('getRoles Error: User has no permissions')
        return []
    }

    const adminClient = createAdminClient()
    const { data, error: adminError } = await adminClient
        .from('roles')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: true })

    if (adminError) {
        console.error('getRoles Error:', adminError)
        return []
    }

    return data as Role[]
}