"use client"

import {SubmitHandler, useForm} from "react-hook-form";
import {z} from "zod";
import {AuthStatus, OAuthProvider, providerImages, signupSchema} from "@/types/auth";
import {zodResolver} from "@hookform/resolvers/zod";
import {useToast} from "@/hooks/use-toast";
import {signInWithProvider, signup} from "@/app/auth/actions";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {Toaster} from "@/components/ui/toaster";

export default function SignupForm() {
    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            tos: false
        }
    })
    const { toast } = useToast()

    const handleRegister: SubmitHandler<z.infer<typeof signupSchema>> = async (data) => {
        const result = await signup(data);

        if (!result || !result.status) {
            console.error("Invalid result returned from signup:", result);
            return;
        }

        if (result.status === AuthStatus.Error) {
            console.log("Signup failed with message:", result.message);
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

            // Redirect to login page in 3 seconds
            setTimeout(() => {
                window.location.href = "/auth/login";
            }, 3000);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <h2 className="scroll-m-20 pb-2 text-6xl font-semibold tracking-tight first:mt-0 text-lightYellow p-4">
                Create Account
            </h2>

            <div className="flex flex-row gap-3 max-w-80 py-4">
                {Object.values(OAuthProvider).map((provider) => (
                    <button key={provider} onClick={() => signInWithProvider(provider)}>
                        <Image src={providerImages[provider]} alt={`${provider} Logo`} width="32" height="32"/>
                    </button>
                ))}
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-3">
                    <FormField control={form.control} name="name" render={({field}) => (
                        <FormItem>
                            <FormLabel className="text-white">Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Name" {...field} className="w-80"/>
                            </FormControl>
                            <FormDescription>
                                Enter your name (This will be displayed to other users)
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <FormField control={form.control} name="email" render={({field}) => (
                        <FormItem>
                            <FormLabel className="text-white">Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Email" type="email" {...field} className="w-80"/>
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
                            <FormLabel className="text-white">Password</FormLabel>
                            <FormControl>
                                <Input placeholder="Confirm Password" type="password" {...field} className="w-80"/>
                            </FormControl>
                            <FormDescription>
                                Enter your password again
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <FormField
                        control={form.control}
                        name="tos"
                        render={({field}) => (
                            <FormItem className="space-y-0">
                                <div className="flex flex-row space-x-3">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel className="text-lightYellow">
                                        I accept terms of service
                                    </FormLabel>
                                </div>
                                <FormMessage className="pt-1" />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-80">SIGNUP</Button>
                </form>
            </Form>

            <p className="text-white text-md leading-none place-self-start pl-14 pt-4">
                Already Registered? <Link href="/auth/login"
                                className="text-lightYellow hover:text-lightYellow/70">Login</Link>
            </p>
            <Toaster/>
        </div>
    )
}