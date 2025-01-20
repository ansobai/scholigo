'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import {
    loginSchema,
    AuthStatus,
    signupSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    OAuthProvider
} from "@/types/auth";
import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

/**
 * Logs in a user with the provided form data.
 *
 * @param {z.infer<typeof loginSchema>} formData - The form data containing email and password.
 * @returns {Promise<{status: AuthStatus, message: string}>} The authentication status and message.
 */
export async function login(formData: z.infer<typeof loginSchema>) {
    const validatedData = loginSchema.safeParse(formData)

    if (!validatedData.success) {
        return {
            status: AuthStatus.Error,
            message: "Invalid form data",
        }
    }

    const supabase = await createClient()
    const { email, password } = validatedData.data
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        return {
            status: AuthStatus.Error,
            message: "Invalid email or password",
        }
    }

    return {
        status: AuthStatus.Success,
        message: "Logged in successfully",
    }
}

/**
 * Signs up a new user with the provided form data.
 *
 * @param {z.infer<typeof signupSchema>} formData - The form data containing name, email, and password.
 * @returns {Promise<{status: AuthStatus, message: string}>} The authentication status and message.
 */
export async function signup(formData: z.infer<typeof signupSchema>) {
    const validatedData = signupSchema.safeParse(formData)

    if (!validatedData.success) {
        console.log("Invalid form data:", validatedData.error)
        return {
            status: AuthStatus.Error,
            message: "Invalid form data",
        }
    }

    const supabase = await createClient()
    const { name, email, password } = validatedData.data
    const { error } = await supabase.auth.signUp({ email, password , options: { data: { 'full_name': name } } })

    if (error) {
        if (error.status === 429) {
            return {
                status: AuthStatus.Error,
                message: "Too many requests, please try again later",
            }
        }

        console.error("Failed to create account:", error)
        return {
            status: AuthStatus.Error,
            message: "Failed to create account",
        }
    }

    revalidatePath('/dashboard', 'layout')

    return {
        status: AuthStatus.Success,
        message: "Account created successfully, please check your inbox. (Redirecting in 3 seconds...)",
    }
}

/**
 * Signs out the current user.
 *
 * @returns {Promise<void>} Redirects the user to the login page.
 */
export async function signout() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const { error } = await supabase.auth.signOut()

    if (error) {
        redirect("/auth/error")
    }

    // Invalidate cache
    revalidateTag(`user_${session?.user.id}`)

    redirect("/auth/login")
}

/**
 * Sends a password reset email to the user.
 *
 * @param {z.infer<typeof forgotPasswordSchema>} formData - The form data containing the email.
 * @returns {Promise<{status: AuthStatus, message: string}>} The authentication status and message.
 */
export async function forgotPassword(formData: z.infer<typeof forgotPasswordSchema>) {
    const validatedData = forgotPasswordSchema.safeParse(formData)

    if (!validatedData.success) {
        console.log("Invalid form data:", validatedData.error)
        return {
            status: AuthStatus.Error,
            message: "Please make sure you've provided a valid email!",
        }
    }

    const supabase = await createClient()
    const { email } = validatedData.data
    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
        console.error("Failed to reset password:", error)
        return {
            status: AuthStatus.Error,
            message: "Failed to reset password",
        }
    }

    return {
        status: AuthStatus.Success,
        message: "Please check your email for a password reset link",
    }
}

/**
 * Resets the user's password with the provided form data.
 *
 * @param {z.infer<typeof resetPasswordSchema>} formData - The form data containing the new password.
 * @returns {Promise<{status: AuthStatus, message: string}>} The authentication status and message.
 */
export async function resetPassword(formData: z.infer<typeof resetPasswordSchema>) {
    const validatedData = resetPasswordSchema.safeParse(formData)

    if (!validatedData.success) {
        console.log("Invalid form data:", validatedData.error)
        return {
            status: AuthStatus.Error,
            message: "Invalid form data",
        }
    }

    const supabase = await createClient()
    const { password } = validatedData.data
    const { error } = await supabase.auth.updateUser({ password: password })

    if (error) {
        console.error("Failed to reset password:", error)
        return {
            status: AuthStatus.Error,
            message: "Failed to reset password",
        }
    }

    return {
        status: AuthStatus.Success,
        message: "Password reset successfully (Redirecting in 3 seconds...)",
    }
}

/**
 * Signs in a user with the specified OAuth provider.
 *
 * @param {OAuthProvider} provider - The OAuth provider to use for sign-in.
 * @returns {Promise<{status: AuthStatus, message: string}>} The authentication status and message.
 */
export async function signInWithProvider(provider: OAuthProvider) {
    const supabase = await createClient()
    const headersList = await headers()
    const origin = headersList.get("origin")

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: `${origin}/auth/callback`,
        }
    })

    if (error) {
        console.error("Failed to sign in with provider:", error)
        return {
            status: AuthStatus.Error,
            message: "Failed to sign in with provider",
        }
    }

    redirect(data.url)
}