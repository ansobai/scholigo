/**
 * Enum representing various permissions.
 */
export enum Permission {
    /** Permission to view settings. */
    VIEW_SETTINGS = 1 << 0,
    /** Permission to create a post. */
    CREATE_POST = 1 << 1,
    /** Permission to upload a file. */
    UPLOAD_FILE = 1 << 2,
    /** Permission to edit a post. */
    EDIT_POST = 1 << 3,
    /** Permission to delete a comment. */
    DELETE_COMMENT = 1 << 4,
    /** Permission to delete a post. */
    DELETE_POST = 1 << 5,
    /** Permission to pin a post. */
    PIN_POST = 1 << 6,
    /** Permission to edit the community. */
    EDIT_COMMUNITY = 1 << 7,
    /** Permission to manage members. */
    MANAGE_MEMBERS = 1 << 8,
    /** Permission to manage roles. */
    MANAGE_ROLES = 1 << 9,
}

/**
 * Bitwise OR of all permissions.
 */
export const allPermissions = Object.values(Permission)
    .filter((p) => typeof p === 'number')
    .reduce((acc, p) => acc | p, 0)

/**
 * Bitwise OR of permissions to create a post and upload a file.
 */
export const uploadPermissions = Permission.CREATE_POST | Permission.UPLOAD_FILE

/**
 * Checks if a user has a specific permission.
 *
 * @param {number} userPermissions - The user's permissions.
 * @param {Permission} permission - The permission to check.
 * @returns {boolean} True if the user has the specified permission, false otherwise.
 */
export function hasPermission(userPermissions: number, permission: Permission): boolean {
    return (userPermissions & permission) === permission
}