"use client"

import {SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";
import {AuthStatus, forgotPasswordSchema, resetPasswordSchema} from "@/types/auth";
import {zodResolver} from "@hookform/resolvers/zod";
import {useToast} from "@/hooks/use-toast";
import {resetPassword} from "@/app/auth/actions";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Toaster} from "@/components/ui/toaster";

interface ResetPasswordPageProps {
    email: string
}

export default function ResetPasswordForm({ email }: ResetPasswordPageProps) {
    const form = useForm<z.infer<typeof resetPasswordSchema>>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            email: email,
            password: "",
            confirmPassword: ""
        }
    })
    const { toast } = useToast()

    const handleForgotPassword: SubmitHandler<z.infer<typeof resetPasswordSchema>> = async (data) => {
        const result = await resetPassword(data);

        if (!result || !result.status) {
            console.error("Invalid result returned from resetPassword:", result);
            return;
        }

        if (result.status === AuthStatus.Error) {
            console.log("Reset password failed with message:", result.message);
            toast({
                title: "Error",
                description: result.message,
                variant: "destructive"
            });
        }

        if (result.status === AuthStatus.Success) {
            toast({
                title: "Success",
                description: result.message,
                variant: "success"
            });

            // Redirect to login page
            setTimeout(() => {
                window.location.href = "/auth/login";
            }, 3000)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <h2 className="scroll-m-20 pb-2 text-6xl font-semibold tracking-tight first:mt-0 text-lightYellow p-4">
                Reset Your Password
            </h2>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleForgotPassword)} className="space-y-3">
                    <FormField control={form.control} name="email" render={({field}) => (
                        <FormItem>
                            <FormLabel className="text-white">Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Email" type="email" disabled {...field} className="w-80"/>
                            </FormControl>
                            <FormDescription>
                                Enter your email address
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <FormField control={form.control} name="password" render={({field}) => (
                        <FormItem>
                            <FormLabel className="text-white">Password</FormLabel>
                            <FormControl>
                                <Input placeholder="Password" type="password" {...field} className="w-80"/>
                            </FormControl>
                            <FormDescription>
                                Enter your password
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <FormField control={form.control} name="confirmPassword" render={({field}) => (
                        <FormItem>
                            <FormLabel className="text-white">Repeat Password</FormLabel>
                            <FormControl>
                                <Input placeholder="Confirm Password" type="password" {...field} className="w-80"/>
                            </FormControl>
                            <FormDescription>
                                Enter your password again
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <Button type="submit" className="w-80">RESET PASSWORD</Button>
                </form>
            </Form>
            <Toaster/>
        </div>
    )
}