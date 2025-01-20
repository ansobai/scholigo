"use client"

import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

/**
 * Error component that displays an error message and a button to redirect the user.
 *
 * @returns {JSX.Element} The rendered error page component.
 */
export default function Error() {

    /**
     * Redirects the user to the home page.
     */
    const redirectPage = () => {
        redirect("/");
    }

    return (
        <main className="flex flex-col items-center justify-center bg-blackBluish space-y-10 h-full w-full">
            <h2 className="text-center text-lightYellow text-5xl">Something went wrong!</h2>
            <Button onClick={redirectPage}>Go Back</Button>
        </main>
    );
}