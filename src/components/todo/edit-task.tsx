'use client'

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task } from "@/types/todo";
import { Tag } from "@/types/tag";
import { toast } from "@/hooks/use-toast";
import {createClient} from "@/utils/supabase/client";

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTaskUpdated: () => void;
    task: Task;
}

export default function EditTaskModal({ isOpen, onClose, onTaskUpdated, task }: EditTaskModalProps) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || "");
    const [priority, setPriority] = useState<string>(task.priority || "none");
    const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.split('T')[0] : "");
    const [status, setStatus] = useState<string>(task.status);
    const [estimatedTime, setEstimatedTime] = useState<number | null>(task.estimated_time);
    const [selectedTags, setSelectedTags] = useState<number[]>(task.tags?.map(tag => tag.id) || []);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient()

    useEffect(() => {
        fetchTags();
    }, []);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                throw new Error("No active session. Please log in again.");
            }

            const updateData: any = {
                title,
                description,
                priority,
                status,
                estimated_time: estimatedTime
            };

            if (dueDate) {
                updateData.due_date = dueDate;
            }

            const { error: taskError } = await supabase
                .from('tasks')
                .update(updateData)
                .eq('id', task.id);

            if (taskError) {
                throw new Error(`Error updating task: ${taskError.message}`);
            }

            // Update task tags
            await supabase.from('task_tags').delete().eq('task_id', task.id);
            if (selectedTags.length > 0) {
                const taskTags = selectedTags.map(tagId => ({ task_id: task.id, tag_id: tagId }));
                const { error: tagError } = await supabase.from('task_tags').insert(taskTags);
                if (tagError) {
                    console.error('Error updating task tags:', tagError);
                }
            }

            toast({
                title: "Success",
                description: "Task updated successfully!",
            });

            onClose();
            onTaskUpdated();
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
                    <DialogTitle>Edit Task</DialogTitle>
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
                                    <SelectItem value="Not started">Not started</SelectItem>
                                    <SelectItem value="in progress">In progress</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
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
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update Task"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

