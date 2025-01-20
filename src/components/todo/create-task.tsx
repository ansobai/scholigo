'use client'

import { Button } from "@/components/ui/button";
import {useState, useEffect, FormEvent, useRef} from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag } from "@/types/tag";
import { toast } from "@/hooks/use-toast";
import {createClient} from "@/utils/supabase/client";

interface CreateTaskButtonProps {
    onTaskCreated: () => void;
}

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskCreated: () => void;
}

export default function CreateTaskButton({ onTaskCreated }: CreateTaskButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleTaskCreated = () => {
        setIsModalOpen(false);
        onTaskCreated();
    };

    return (
        <>
            <Button onClick={() => setIsModalOpen(true)}>Create New Task</Button>
            <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onTaskCreated={handleTaskCreated} />
        </>
    );
}

export function CreateTaskModal({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) {
    const userId = useRef<string | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<string>("none");
    const [dueDate, setDueDate] = useState("");
    const [status, setStatus] = useState<string>("Not started");
    const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const supabase = createClient()

    useEffect(() => {
        fetchUserId();
        fetchTags();
    }, []);

    useEffect(() => {
        setIsFormValid(title.trim() !== '');
    }, [title]);

    const fetchUserId = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            userId.current = user.id;
        }
    }

    const fetchTags = async () => {
        const { data, error } = await supabase.from('tags').select('id, name, color_code');
        if (error) {
            console.error('Error fetching tags:', error);
            toast({
                title: "Error",
                description: "Failed to fetch tags. Please try again.",
                variant: "destructive",
            });
        } else {
            setAvailableTags(data || []);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const taskData: any = {
                user_id: userId.current,
                title,
                description,
                priority,
                status,
                estimated_time: estimatedTime
            };

            if (dueDate.trim() !== '') {
                taskData.due_date = dueDate;
            }

            const { data: createdTask, error: taskError } = await supabase
                .from('tasks')
                .insert([taskData])
                .select();

            if (taskError) {
                console.error('Error creating task:', taskError);
                throw new Error("Failed to create task. Please try again.");
            }

            if (createdTask && createdTask[0]) {
                const taskId = createdTask[0].id;

                // Handle tags
                if (selectedTags.length > 0) {
                    const taskTags = selectedTags.map(tagId => ({ task_id: taskId, tag_id: tagId, user_id: userId.current }));
                    const { error: tagError } = await supabase.from('task_tags').insert(taskTags);
                    if (tagError) {
                        console.error('Error adding tags to task:', tagError);
                    }
                }

                toast({
                    title: "Success",
                    description: "Task created successfully!",
                });

                setTitle("");
                setDescription("");
                setPriority("none");
                setDueDate("");
                setStatus("Not started");
                setEstimatedTime(null);
                setSelectedTags([]);
                onClose();
                onTaskCreated();
            }
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="priority" className="text-right">
                                Priority
                            </Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dueDate" className="text-right">
                                Due Date
                            </Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Not started">Not Started</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="estimatedTime" className="text-right">
                                Estimated Time (minutes)
                            </Label>
                            <Input
                                id="estimatedTime"
                                type="number"
                                min="0"
                                value={estimatedTime === null ? '' : estimatedTime}
                                onChange={(e) => setEstimatedTime(e.target.value === '' ? null : parseInt(e.target.value))}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tags" className="text-right">
                                Tags
                            </Label>
                            <Select
                                value={selectedTags.join(',')}
                                onValueChange={(value) => setSelectedTags(value.split(',').map(Number))}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select tags" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTags.map((tag) => (
                                        <SelectItem key={tag.id} value={tag.id.toString()}>
                                            <div className="flex items-center">
                                                <div
                                                    className="w-3 h-3 rounded-full mr-2"
                                                    style={{backgroundColor: tag.color_code}}
                                                ></div>
                                                {tag.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading || !isFormValid}>
                            {isLoading ? "Creating..." : "Create Task"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}


