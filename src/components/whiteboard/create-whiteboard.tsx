'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {useRouter} from "next/navigation";
import {useToast} from "@/hooks/use-toast";
import {z} from "zod";
import {createWhiteboardSchema} from "@/types/whiteboard";
import {zodResolver} from "@hookform/resolvers/zod";
import {Input} from "@/components/ui/input";
import {createWhiteboard} from "@/app/dashboard/whiteboard/actions/whiteboard";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {SubmitHandler, useForm} from "react-hook-form";

export function CreateWhiteboardModal() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Create New Whiteboard</Button>
            </DialogTrigger>
            <DialogContent className="w-fit">
                <DialogHeader>
                    <DialogTitle>Create New Whiteboard</DialogTitle>
                    <DialogDescription>
                        Enter a name for your new whiteboard.
                    </DialogDescription>
                </DialogHeader>
                <CreateWhiteboardForm />
            </DialogContent>
        </Dialog>
    )
}

export function CreateWhiteboardForm() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm<z.infer<typeof createWhiteboardSchema>>({
        resolver: zodResolver(createWhiteboardSchema),
        defaultValues: {
            name: '',
        }
    })

    const handleCreateWhiteboard: SubmitHandler<z.infer<typeof createWhiteboardSchema>> = async (data) => {
        setIsLoading(true)

        const result = await createWhiteboard(data)
        setIsLoading(false)

        if (!result || !result.status) {
            console.error('Invalid result returned from createWhiteboard:', result)
            return
        }

        if (result.status === 'error') {
            console.log('Create whiteboard failed with message:', result.message)
            toast({
                title: 'Error',
                description: result.message,
                variant: 'destructive',
            })
            router.refresh()
        } else {
            toast({
                title: 'Success',
                description: result.message,
                variant: 'success',
            })
            router.push(`/dashboard/whiteboard/${result.id}`)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateWhiteboard)} className="space-y-3 w-80">
                <FormField control={form.control} name="name" render={({field}) => (
                    <FormItem>
                        <FormLabel className="text-white">Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Name" type="text" {...field} className="w-80"/>
                        </FormControl>
                        <FormDescription>
                            Enter your email address
                        </FormDescription>
                        <FormMessage/>
                    </FormItem>
                )}/>

                <Button type="submit" disabled={isLoading} className="w-80">
                    {isLoading ? 'Creating...' : 'Create Whiteboard'}
                </Button>
            </form>
        </Form>
    )
}