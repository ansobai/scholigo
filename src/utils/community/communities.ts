import 'server-only'
import {Communities, UserCommunities} from "@/types/communities/communities";
import {CommunitiesCache} from "@/lib/redis/communities";
import {createAdminClient} from "@/utils/supabase/admin";
import {OutputBlockData} from "@editorjs/editorjs";

const cache = CommunitiesCache.getInstance()

/**
 * Get the communities that the user is a member of.
 * WARNING: This function executes as supabase admin.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Promise<UserCommunities[]>} A promise that resolves to an array of user communities.
 */
export async function getUserCommunities(userId: string): Promise<UserCommunities[]> {
    const start = performance.now(); // Start time
    let userCommunities = await cache.getValue<string[]>(userId)

    if (!userCommunities) {
        const supabase = createAdminClient()

        const {data, error} = await supabase
            .from('community_members')
            .select('community_id')
            .eq('user_id', userId)

        if (error) {
            console.error('getUserCommunities Error:', error)
            return []
        }

        userCommunities = data.map((item: any) => item.community_id)

        // Cache for future use
        await cache.setValue(userId, userCommunities)
    }

    const end = performance.now(); // End time
    console.log(`Fetching user's communities took: ${(end - start).toFixed(3)} ms`);

    // get communities and set the isOwner to true if createdBy is the same as the user id
    const communities = await getCommunities(userCommunities)

    return communities.map((community) => {
        return {
            ...community,
            isOwner: community.created_by == userId,
            isMember: true,
        }
    })
}

/**
 * Get a specific community that the user is a member of.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} communityId - The ID of the community.
 * @returns {Promise<UserCommunities | null>} A promise that resolves to the user community or null if not found.
 */
export async function getUserCommunity(userId: string, communityId: string): Promise<UserCommunities | null> {
    const communities = await getUserCommunities(userId)

    return communities.find((community) => community.id === communityId) || null
}

/**
 * Get the recommended communities for the user.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Promise<UserCommunities[]>} A promise that resolves to an array of recommended user communities.
 */
export async function getUserRecommendedCommunities(userId: string): Promise<UserCommunities[]> {
    const start = performance.now(); // Start time
    let recommendedCommunities = await cache.getValue<string[]>(`recommended-${userId}`)

    if (!recommendedCommunities) {
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .rpc('get_random_communities', { usr: userId, limit_count: 10 });

        if (error || !data) {
            console.error('getUserRecommendedCommunities Error:', error)
            return []
        }

        recommendedCommunities = data.map((item: any) => item.id)

        // Cache for future use
        await cache.setValue(`recommended-${userId}`, recommendedCommunities)
    }

    const end = performance.now(); // End time
    console.log(`Fetching user's recommended communities took: ${(end - start).toFixed(3)} ms`);
    // Now lets fetch info about the communities
    const communities = await getCommunities(recommendedCommunities!)

    return communities.map((community: Communities) => {
        return {
            ...community,
            isOwner: community.created_by === userId,
            isMember: false,
        }
    })
}

/**
 * Get communities by their IDs.
 * WARNING: This function executes as supabase admin.
 *
 * @param {string[]} communities - An array of community IDs.
 * @returns {Promise<Communities[]>} A promise that resolves to an array of communities.
 */
export async function getCommunities(communities: string[]): Promise<Communities[]> {
    const cachedCommunities = await cache.getMultiple<Communities>(communities)

    const missingCommunitiesIds = communities.filter(id => !cachedCommunities[id])
    if (missingCommunitiesIds.length > 0) {
        const supabase = createAdminClient()

        // also get the count of members in a community from the community_members table
        const {data, error} = await supabase
            .from('communities')
            .select(`
                *,
                community_members (
                 count
                )
            `)
            .in('id', missingCommunitiesIds)

        if (error) {
            console.error('getUserCommunities Error:', error)
            return []
        }

        // map the data to a Record<string, Communities> object to be used in the cache
        const missingCommunities = data.reduce((acc: Record<string, Communities>, item: any) => {
            acc[item.id] = {
                ...item,
                members_count: item.community_members[0]?.count || 0, // Flatten members_count
            };
            return acc;
        }, {});

        // Cache the missing communities
        await cache.setBulkValue(missingCommunities)

        // Merge the missing communities with the cached ones
        Object.assign(cachedCommunities, missingCommunities)
    }

    return Object.values(cachedCommunities).filter((community):
    community is Communities => community !== null)
}

/**
 * Clear the cache for a specific community.
 *
 * @param {string} communityId - The ID of the community.
 */
export function clearCommunityCache(communityId: string) {
    cache.delete(communityId)
}

/**
 * Clear the cache for the communities of a specific user.
 *
 * @param {string} userId - The ID of the user.
 */
export function clearUserCommunitiesCache(userId: string) {
    cache.delete(userId)
}

/**
 * Add a user to a community.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} communityId - The ID of the community.
 * @returns {Promise<boolean>} A promise that resolves to true if the user was added successfully, false otherwise.
 */
export async function addUserToCommunity(userId: string, communityId: string) {
    const supabase = createAdminClient()

    const {error} = await supabase.from('community_members').upsert({
        user_id: userId,
        community_id: communityId
    })

    if (error) {
        console.error('addUserToCommunity Error:', error)
        return false
    }

    // Update cache
    cache.getValue<string[]>(userId).then((value) => {
        if (value) {
            cache.setValue(userId, [...value, communityId])
        }
    })
    await cache.delete(`recommended-${userId}`)

    cache.getValue<Communities>(communityId).then((value) => {
        if (value) {
            cache.setValue(communityId, {
                ...value,
                members_count: value.members_count? value.members_count + 1 : 1
            })
        }
    })

    return true
}

/**
 * Remove a user from a community.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} communityId - The ID of the community.
 * @returns {Promise<boolean>} A promise that resolves to true if the user was removed successfully, false otherwise.
 */
export async function removeUserFromCommunity(userId: string, communityId: string) {
    // Update cache
    cache.getValue<string[]>(userId).then((value) => {
        if (value) {
            cache.setValue(userId, value.filter((id) => id !== communityId))
        }
    })
    await cache.delete(`recommended-${userId}`)

    cache.getValue<Communities>(communityId).then((value) => {
        if (value) {
            cache.setValue(communityId, {
                ...value,
                members_count: value.members_count ? value.members_count - 1 : 0
            })
        }
    })

    return true
}

/**
 * Update the icon of a community.
 *
 * @param {string} communityId - The ID of the community.
 * @param {File} icon - The new icon file.
 * @returns {Promise<boolean>} A promise that resolves to true if the icon was updated successfully, false otherwise.
 */
export async function updateCommunityIcon(communityId: string, icon: File) {
    const supabase = createAdminClient()

    const { error } = await supabase.storage.from('community_icons').upload(`${communityId}/icon.${icon.name.split('.').pop()}`, icon, { upsert: true });

    if (error) {
        console.error('updateCommunityIcon Error:', error)
        return false
    }

    // Update cache
    cache.getValue<Communities>(communityId).then((value) => {
        if (value) {
            cache.setValue(communityId, {
                ...value,
                icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/community_icons/${communityId}/icon.${icon.name.split('.').pop()}`
            })
        }
    })

    // Update database
    await supabase.from('communities').update({ icon: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/community_icons/${communityId}/icon.${icon.name.split('.').pop()}` }).eq('id', communityId);

    return true
}