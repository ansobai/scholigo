'use server'

import { createClient } from '@/utils/supabase/server'
import {getUserCommunityPermissions, invalidateUserCommunityPermissions} from "@/utils/community/roles";
import {hasPermission, Permission} from "@/types/communities/permissions";
import {createAdminClient} from "@/utils/supabase/admin";
import {Member} from "@/types/communities/communities";

/**
 * Updates the roles of a member in a community.
 *
 * @param {string} userId - The ID of the user whose roles are to be updated.
 * @param {string} communityId - The ID of the community.
 * @param {number[]} roleIds - An array of role IDs to assign to the user.
 * @returns {Promise<{ success: boolean }>} A promise that resolves to an object indicating success.
 * @throws {Error} Throws an error if the user has no permissions or if the roles update fails.
 */
export async function updateMemberRoles(
    userId: string,
    communityId: string,
    roleIds: number[]
) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        console.error('updateMemberRoles Error:', error)
        throw new Error('Failed to update roles')
    }

    const userPermissions = await getUserCommunityPermissions(user.id, communityId)

    if (!userPermissions || !hasPermission(userPermissions, Permission.MANAGE_MEMBERS)) {
        console.error('updateMemberRoles Error: User has no permissions')
        throw new Error('User has no permissions')
    }

    const adminClient = createAdminClient()
    // First delete existing roles
    await adminClient
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('community_id', communityId)

    // Then insert new roles
    const { error: newRolesError } = await adminClient
        .from('user_roles')
        .insert(
            roleIds.map(roleId => ({
                user_id: userId,
                role_id: roleId,
                community_id: communityId
            }))
        )

    if (newRolesError) {
        console.error('updateMemberRoles Error:', newRolesError)
        throw new Error('Failed to update roles')
    }

    invalidateUserCommunityPermissions(userId, communityId)

    return { success: true }
}

/**
 * Searches for members in a community based on a query string.
 *
 * @param {string} communityId - The ID of the community.
 * @param {string} query - The search query string.
 * @returns {Promise<Member[] | Error>} A promise that resolves to an array of members or an error.
 * @throws {Error} Throws an error if the user has no permissions or if the search fails.
 */
export async function searchMembers(
    communityId: string,
    query: string
) : Promise<Member[] | Error> {
    const supabase = await createClient()
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) {
        if (error || !user) {
            console.error("searchMembers Error:", error);
            throw new Error("Failed to search members");
        }
    }

    const userPermissions = await getUserCommunityPermissions(user.id, communityId);

    if (!userPermissions || !hasPermission(userPermissions, Permission.MANAGE_MEMBERS)) {
        console.error('searchMembers Error: User has no permissions')
        throw new Error('User has no permissions')
    }

    const adminClient = createAdminClient()
    const { data, error: membersError } = await adminClient
        .from('profiles')
        .select(`
          id,
          name,
            avatar_url,
        community_members (
           joined_at
        ),
      user_roles (
         role_id,
         roles (
           name,
           color,
           permissions
         )
      )
    `)
        .eq('community_members.community_id', communityId)
        .textSearch('name', `${query}:*`)
        .limit(20)

    if (membersError) {
        console.error('searchMembers Error:', membersError)
        throw new Error('Failed to search members')
    }

    return data as unknown as Member[];
}