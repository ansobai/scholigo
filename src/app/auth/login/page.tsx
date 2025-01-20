import logo from '@public/logo.png'
import Image from "next/image";
import welcome from "@public/login.svg"
import {LoginForm} from "@/components/login-form";
import {createClient} from "@/utils/supabase/server";
import {redirect} from "next/navigation";

/**
 * LoginPage component that handles user authentication and displays the login page.
 *
 * @returns {JSX.Element} The rendered login page component.
 */
export default async function LoginPage() {

    // Create a Supabase client instance
    const supabase = await createClient()

    // Get the current authenticated user
    const auth = await supabase.auth.getUser()

    // If the user is authenticated, redirect to the dashboard
    if (!auth.error && auth.data.user) {
        redirect("/dashboard")
    }

    return (
        <div className="bg-blackBluish flex flex-col md:flex-row h-full w-full">
            <div className="flex flex-col bg-gradient-to-tr from-darkBlue via-darkBlue via-45% to-lightBlue to-95% p-4 md:w-1/2 justify-between">
                <Image src={logo} alt="Scholigo Logo" width="52" height="52" className="place-self-start mt-4 ml-4"/>

                <div className="flex flex-col items-center justify-center flex-grow gap-8">
                    <h2 className="scroll-m-20 pb-2 text-5xl font-semibold tracking-tight first:mt-0 text-lightYellow p-4">
                        Welcome Back!
                    </h2>
                    <Image src={welcome} alt="Welcome" width="600" height="600" className="mt-4"/>
                </div>
            </div>
            <div className="flex flex-col justify-center items-center md:w-1/2 h-screen p-8">
                <LoginForm/>
            </div>
        </div>
    )
}