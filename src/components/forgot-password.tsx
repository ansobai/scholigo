import {useForm} from "react-hook-form";
import {z} from "zod";
import {AuthStatus, forgotPasswordSchema} from "@/types/auth";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import {forgotPassword} from "@/app/auth/actions";
import {toast} from "@/hooks/use-toast";

export function ForgotPassword() {
    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        }
    })
    const [isOpen, setIsOpen] = useState(false)

    const handleForgotPassword = async (data: z.infer<typeof forgotPasswordSchema>) => {
        const result = await forgotPassword(data);

        if (!result || !result.status) {
            console.error("Invalid result returned from forgotPassword:", result);
            return;
        }

        if (result.status === AuthStatus.Error) {
            console.log("Forgot password failed with message:", result.message);
            setIsOpen(false);
            toast({
                title: "Error",
                description: result.message,
                variant: "destructive"
            });
        }

        if (result.status === AuthStatus.Success) {
            setIsOpen(false);
            toast({
                title: "Success",
                description: result.message,
                variant: "success"
            });
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <p className="text-slate-500 text-sm leading-none py-2">
                    Forgot your password? <button type="button" className="text-lightYellow hover:text-lightYellow/70">Click
                    Here</button>
                </p>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                        Enter your email address to reset your password.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-3" id="resetPasswordForm">
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

                        <Button onClick={form.handleSubmit(handleForgotPassword)}>RESET PASSWORD</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}