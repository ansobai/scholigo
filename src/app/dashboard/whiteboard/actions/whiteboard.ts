'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import {createWhiteboardSchema} from "@/types/whiteboard";
import {createAdminClient} from "@/utils/supabase/admin";
import {revalidatePath} from "next/cache";

export async function createWhiteboard(formSchema: z.infer<typeof createWhiteboardSchema>) {
    const validatedData = createWhiteboardSchema.safeParse(formSchema)

    if (!validatedData.success) {
        return {
            status: "error",
            message: "Invalid form data",
        }
    }

    const { name } = validatedData.data
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()

    const { data, error } = await supabase
        .from('whiteboards')
        .insert({
            created_by: user.user?.id,
            name,
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating whiteboard:', error)
        return {
            status: "error",
            message: "Failed to create new whiteboard!"
        }
    }

    return {
        status: "success",
        id: data.id,
        message: "Created new whiteboard successfully",
    }
}

export async function deleteWhiteboard(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('whiteboards')
        .delete()
        .eq('id', id)
        .eq('created_by', user?.id)

    if (error) {
        console.error('Error deleting whiteboard:', error)
        return {
            status: "error",
            message: "Failed to delete whiteboard!"
        }
    }

    return {
        status: "success",
        message: "Deleted whiteboard successfully",
    }
}

export async function addUserToWhiteboard(whiteboardId: string, userId: string) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from('whiteboard_collaborators')
        .insert({
            whiteboard_id: whiteboardId,
            user_id: userId,
            role: 'collaborator',
        })

    if (error) {
        //If duplicating the user, return a success message
        if (error.message.includes('duplicate key value violates unique constraint')) {
            return {
                status: "success",
                message: "User is already a collaborator on this whiteboard",
            }
        }

        console.error('Error adding user to whiteboard:', error)
        return {
            status: "error",
            message: "Failed to add user to whiteboard!"
        }
    }

    return {
        status: "success",
        message: "Added user to whiteboard successfully",
    }
}

export async function getWhiteboardCollaborators(whiteboardId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc("get_whiteboard_collaborators", {
        wb_id: whiteboardId,
    })

    if (error) {
        console.error('Error getting whiteboard collaborators:', error)
        return {
            status: "error",
            message: "Failed to get whiteboard collaborators!"
        }
    }

    return {
        status: "success",
        collaborators: data,
    }
}

export async function removeUserFromWhiteboard(whiteboardId: string, userId: string) {
    const supabase = await createClient()

    const { error } = await supabase.rpc("delete_collaborator", {
        wb_id: whiteboardId,
        cb_id: userId,
    })

    if (error) {
        console.error('Error removing user from whiteboard:', error)
        return {
            status: "error",
            message: "Failed to remove user from whiteboard!"
        }
    }

    revalidatePath(`/dashboard/whiteboard/${whiteboardId}`, "page")

    return {
        status: "success",
        message: "Removed user from whiteboard successfully",
    }
}

export async function removeSelfFromWhiteboard(whiteboardId: string) {
    const supabase = await createClient()

    const { error } = await supabase.rpc("leave_whiteboard", {
        wb_id: whiteboardId,
    })

    if (error) {
        console.error('Error removing user from whiteboard:', error)
        return {
            status: "error",
            message: "Failed to remove user from whiteboard!"
        }
    }

    revalidatePath(`/dashboard/whiteboard/${whiteboardId}`, "page")

    return {
        status: "success",
        message: "Removed user from whiteboard successfully",
    }
}