import {create} from "zustand/react";
import {getUserPermissions} from "@/app/dashboard/communities/actions/permissions";
import {createClient} from "@/utils/supabase/client";

interface PermissionsState {
    communities: Record<string, number>,
    currentCommunityId: string | null,
    initCommunityPermissions: (communityId: string) => Promise<void>;
    loadUserPermissions: (communityId: string) => Promise<void>,
    setCurrentCommunity: (communityId: string) => void;
    getCurrentCommunityPermissions: () => number | null;
}



/**
 * Zustand store for managing user permissions in communities.
 */
export const useRoleStore = create<PermissionsState>((set, get) => ({
    communities: {},
    currentCommunityId: null,

    /**
     * Initializes community permissions by loading them and subscribing to changes.
     *
     * @param {string} communityId - The ID of the community to initialize permissions for.
     */
    initCommunityPermissions: async (communityId: string) => {
        if (get().communities[communityId]) return // already loaded

        await get().loadUserPermissions(communityId)

    
    },

    /**
     * Loads user permissions for a specific community.
     *
     * @param {string} communityId - The ID of the community to load permissions for.
     */
    loadUserPermissions: async (communityId: string) => {
        const permissions = await getUserPermissions(communityId);

        set(state => ({
            ...state,
            communities: {
                ...state.communities,
                [communityId]: permissions
            }
        }));
    },

    /**
     * Sets the current community and initializes its permissions.
     *
     * @param {string} communityId - The ID of the community to set as current.
     */
    setCurrentCommunity: (communityId: string) => {
        get().initCommunityPermissions(communityId)
        set({ currentCommunityId: communityId })
    },

    /**
     * Gets the permissions for the current community.
     *
     * @returns {number | null} The permissions for the current community, or null if no community is set.
     */
    getCurrentCommunityPermissions: () => {
        const { currentCommunityId, communities } = get()
        return currentCommunityId ? communities[currentCommunityId] : null
    }
}));