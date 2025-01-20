"use client"

import {z} from 'zod';
import {SubmitHandler, useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {login, signInWithProvider} from '@/app/auth/actions'
import {AuthStatus, loginSchema, OAuthProvider, providerImages} from "@/types/auth";
import {useToast} from "@/hooks/use-toast";
import {Toaster} from "@/components/ui/toaster";
import {ForgotPassword} from "@/components/forgot-password";

export function LoginForm() {
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })
    const { toast } = useToast()

    const handleLogin: SubmitHandler<z.infer<typeof loginSchema>> = async (data) => {
        const result = await login(data);

        if (!result || !result.status) {
            console.error("Invalid result returned from login:", result);
            return;
        }

        if (result.status === AuthStatus.Error) {
            console.log("Login failed with message:", result.message);
            toast({
                title: "Error",
                description: result.message,
                variant: "destructive"
            });
        }
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <h2 className="scroll-m-20 pb-2 text-6xl font-semibold tracking-tight first:mt-0 text-lightYellow p-4">
                Login
            </h2>
            <p className="text-white leading-7 pb-6 text-lg">
                Welcome back! Please login below
            </p>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-3">
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
                                <Input placeholder="***************" type="password" {...field} className="w-80"/>
                            </FormControl>
                            <FormDescription>
                                Enter your password
                            </FormDescription>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <ForgotPassword />

                    <Button type="submit" className="w-80">LOGIN</Button>
                </form>
            </Form>

            <div className="flex flex-row gap-3 max-w-80 py-4">
                {Object.values(OAuthProvider).map((provider) => (
                    <button key={provider} onClick={() => signInWithProvider(provider)}>
                        <Image src={providerImages[provider]} alt={`${provider} Logo`} width="32" height="32"/>
                    </button>
                ))}
            </div>

            <p className="text-white text-md leading-none place-self-start pl-2">
                New User? <Link href="/auth/signup"
                                            className="text-lightYellow hover:text-lightYellow/70">Signup</Link>
            </p>
            <Toaster />
        </div>
    )
}