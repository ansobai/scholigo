import {useRoleStore} from "@/app/stores/role-store";
import {hasPermission, Permission} from "@/types/communities/permissions";

/**
 * Custom hook to manage and check user permissions within a community.
 *
 * @returns {Object} The permissions-related functions and data.
 * @returns {Function} checkPermission - Function to check if a user has a specific permission.
 * @returns {Function} setCurrentCommunity - Function to set the current community.
 * @returns {number} userPermissions - The current community permissions of the user.
 */
export function usePermissions() {
    const { getCurrentCommunityPermissions, setCurrentCommunity } = useRoleStore()

    /**
     * Checks if the user has a specific permission.
     *
     * @param {Permission} permission - The permission to check.
     * @returns {boolean} True if the user has the permission, false otherwise.
     */
    const checkPermission = (permission: Permission) => {
        const currentCommunityPermissions = getCurrentCommunityPermissions()
        if (!currentCommunityPermissions) return false

        return hasPermission(currentCommunityPermissions, permission)
    }

    return {
        userPermissions: getCurrentCommunityPermissions || 0,
        checkPermission,
        setCurrentCommunity,
    }
}