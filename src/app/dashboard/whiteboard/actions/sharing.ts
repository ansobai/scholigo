'use server'

import {WhiteboardShare} from "@/types/whiteboard";
import {createClient} from "@/utils/supabase/server";
import {nanoid} from "nanoid";
import {createAdminClient} from "@/utils/supabase/admin";

export async function generateSharingCode(whiteboardId: string, isPermanent: boolean = false): Promise<WhiteboardShare | null> {
    const supabase = await createClient()
    const token = nanoid(32) // Generate a longer token for one-time use

    const expiresAt = isPermanent ? null : new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

    const { data, error } = await supabase
        .from('whiteboard_shares')
        .insert({
            whiteboard_id: whiteboardId,
            token,
            is_permanent: isPermanent,
            expires_at: expiresAt
        })
        .select()

    if (error) {
        console.error('Error generating sharing code:', error)
        return null
    }

    return {
        token,
        is_permanent: isPermanent,
        expires_at: expiresAt
    }
}

export async function refreshSharingCode(whiteboardId: string, isPermanent: boolean = false) {
    const supabase = await createClient()

    // Delete existing sharing code
    await supabase
        .from('whiteboard_shares')
        .delete()
        .match({ whiteboard_id: whiteboardId })

    // Generate new sharing code
    return generateSharingCode(whiteboardId, isPermanent)
}

export async function validateSharingToken(whiteboardId: string, token: string): Promise<boolean> {
    const supabase = createAdminClient()

    const { data, error } = await supabase
        .from('whiteboard_shares')
        .select('whiteboard_id, is_permanent, expires_at')
        .eq('token', token)
        .eq('whiteboard_id', whiteboardId)
        .single()

    if (error || !data) {
        return false
    }

    if (!data.is_permanent && data.expires_at && new Date(data.expires_at) < new Date()) {
        // Token has expired
        return false
    }

    // If it's a one-time use token and not permanent, delete it
    if (!data.is_permanent) {
        await supabase
            .from('whiteboard_shares')
            .delete()
            .match({ token })
    }

    return true
}

export async function getSharingInfo(whiteboardId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('whiteboard_shares')
        .select('*')
        .eq('whiteboard_id', whiteboardId)
        .single()

    if (error || !data) {
        return null
    }

    if (!data.is_permanent && data.expires_at && new Date(data.expires_at) < new Date()) {
        // Code has expired
        return null
    }

    return data
}