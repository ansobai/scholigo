import { z } from 'zod';

export interface Whiteboard {
    id: string,
    created_by: string,
    name: string,
    created_at: string,
    updated_at: string,
}

export interface WhiteboardShare {
    token: string,
    is_permanent: boolean,
    expires_at: Date | null,
}

export interface WhiteboardCollaborator {
    user_id: string,
    role: 'owner' | 'collaborator',
    name: string,
    avatar_url: string,
    last_access: string,
}

export const createWhiteboardSchema = z.object({
    name: z.string().min(1, 'Whiteboard name is required').
    max(30, 'Whiteboard name must be 30 characters or less'),
})