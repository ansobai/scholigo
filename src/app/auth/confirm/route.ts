import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Handles the GET request for email OTP confirmation.
 *
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<void>} - Redirects the user based on the OTP verification result.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const next = searchParams.get('next') ?? '/dashboard'

    if (token_hash && type) {
        const supabase = await createClient()

        const auth = await supabase.auth.getUser()
        if (!auth.error && auth.data.user) {
            redirect("/dashboard")
        }

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        if (!error) {
            // redirect user to specified redirect URL or root of app
            redirect(next)
        }
    }

    // Redirect to error page if token_hash or type is missing or invalid
    redirect('/auth/error')
}