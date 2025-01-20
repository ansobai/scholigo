import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import logo from "@public/logo.png";
import forgotPass from "@public/oauth/forgot_pass.svg";
import ResetPasswordForm from "@/components/reset-password";

/**
 * ResetPasswordPage component that handles the password reset process and displays the reset password page.
 *
 * @returns {JSX.Element} The rendered reset password page component.
 */
export default async function ResetPasswordPage() {
    // Create a Supabase client instance
    const supabase = await createClient();

    // Get the current authenticated user
    const auth = await supabase.auth.getUser();

    // If there is an error in authentication, redirect to the dashboard
    if (auth.error) {
        redirect("/dashboard");
    }

    return (
        <div className="bg-blackBluish flex flex-col md:flex-row h-full w-full">
            <div className="flex flex-col justify-center items-center md:w-1/2 h-screen p-8">
                <ResetPasswordForm email={auth.data.user.email!} />
            </div>
            <div
                className="flex flex-col bg-gradient-to-tr from-darkBlue via-darkBlue via-45% to-lightBlue to-95% p-4 md:w-1/2 justify-between">
                <Image src={logo} alt="Scholigo Logo" width="52" height="52" className="place-self-end mt-4 ml-4" />

                <div className="flex flex-col items-center justify-center flex-grow gap-8">
                    <h2 className="scroll-m-20 pb-2 text-5xl font-semibold tracking-tight first:mt-0 text-lightYellow p-4">
                        Forgot Your Password?
                    </h2>
                    <Image src={forgotPass} alt="Forgot Password Image" width="600" height="600" className="mt-4" />
                </div>
            </div>
        </div>
    );
}