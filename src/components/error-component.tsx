'use client'

import Image from "next/image";
import errorSvg from "@public/error.svg";
import {Button} from "@/components/ui/button";
import {redirect} from "next/navigation";

export type ErrorComponentProps = {
    error: string,
    returnTo: string,
    svg?: string
}

export default function ErrorComponent({ error, returnTo, svg } : ErrorComponentProps) {
    return (
        <div className="h-full w-full p-5 flex flex-col place-content-center items-center gap-3">
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-lightYellow lg:text-5xl">
                Error: {error}
            </h1>
            <Image src={svg ? svg : errorSvg} alt="Error Image" width="800" height="800" />
            <div className="flex flex-col md:flex-row p-5 gap-4">
                <Button variant="default" onClick={() => redirect(returnTo)}>
                    Return to previous page
                </Button>
                <Button variant="outline" onClick={() => redirect("/dashboard")}>
                    Return to home page
                </Button>
            </div>
        </div>
    );
}