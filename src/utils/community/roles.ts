import {CommunitiesCache} from "@/lib/redis/communities";
import {createAdminClient} from "@/utils/supabase/admin";
import {getUserCommunity} from "@/utils/community/communities";
import {allPermissions} from "@/types/communities/permissions";

const cache = CommunitiesCache.getInstance()

/**
 * Get the permissions of a user in a specific community.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} communityId - The ID of the community.
 * @returns {Promise<number>} A promise that resolves to the user's permissions in the community.
 */
export async function getUserCommunityPermissions(userId: string, communityId: string): Promise<number> {
    const cachedPermissions = await cache.getValue<number>(`permissions:${communityId}:${userId}`)

    if (cachedPermissions) {
        return cachedPermissions
    }

    const supabase = createAdminClient()

    const {data, error} = await supabase.from('user_roles')
        .select('roles(permissions)')
        .eq('user_id', userId)
        .eq('community_id', communityId)

    if (error || !data) return 0;

    const userCommunity = await getUserCommunity(userId, communityId)

    // @ts-ignore
    const permissions = userCommunity?.isOwner ? allPermissions : data.reduce((acc, role) => acc | role.roles.permissions, 0);

    await cache.setValue(`permissions:${communityId}:${userId}`, permissions)

    return permissions
}

/**
 * Invalidate the cached permissions for all users in a specific community.
 *
 * @param {string} communityId - The ID of the community.
 */
export async function invalidateCommunityPermissions(communityId: string) {
    const keys = await cache.getKeys(`permissions:${communityId}:*`)

    await cache.deleteKeys(keys)
}

/**
 * Invalidate the cached permissions for a specific user across all communities.
 *
 * @param {string} userId - The ID of the user.
 */
export async function invalidateUserPermissions(userId: string) {
    const keys = await cache.getKeys(`permissions:*:${userId}`)

    await cache.deleteKeys(keys)
}

/**
 * Invalidate the cached permissions for a specific user in a specific community.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} communityId - The ID of the community.
 */
export async function invalidateUserCommunityPermissions(userId: string, communityId: string) {
    await cache.delete(`permissions:${communityId}:${userId}`)
}