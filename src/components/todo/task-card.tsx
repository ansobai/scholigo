'use client'

import { useState, useRef } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Task, Subtask } from "@/types/todo";
import { useRouter } from 'next/navigation';
import { MoreHorizontal, ChevronDown, ChevronUp, Edit, Trash2, Clock, Paperclip, Archive } from 'lucide-react';
import EditTaskModal from "@/components/todo/edit-task";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {createClient} from "@/utils/supabase/client";

function getContrastColor(hexColor: string | undefined) {
    if (!hexColor) {
        return 'black';
    }
    const hex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
    if (hex.length !== 6) {
        return 'black';
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 'black' : 'white';
}

interface TaskCardProps {
    userId: string | null;
    task: Task;
    onTaskUpdated: () => void;
    onTaskDeleted: (taskId: number) => void;
    onTaskArchived: (taskId: number) => void;
}

export default function TaskCard({ userId, task, onTaskUpdated, onTaskDeleted, onTaskArchived }: TaskCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const supabase = createClient()
    const router = useRouter();

    const getStatusColor = (status: Task['status']) => {
        switch (status) {
            case 'Not started':
                return 'bg-gray-500';
            case 'In Progress':
                return 'bg-blue-500';
            case 'Pending':
                return 'bg-yellow-500';
            case 'Completed':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    const handleSubtaskToggle = async (subtaskId: number, newStatus: 'pending' | 'completed') => {
        const { error } = await supabase
            .from('subtasks')
            .update({ status: newStatus })
            .eq('id', subtaskId);

        if (error) {
            console.error('Error updating subtask:', error);
        } else {
            setSubtasks(subtasks.map(st =>
                st.id === subtaskId ? { ...st, status: newStatus } : st
            ));
            router.refresh();
        }
    };

    const handleAddSubtask = async () => {
        if (newSubtaskTitle.trim() === '') return;

        const { data, error } = await supabase
            .from('subtasks')
            .insert([
                { task_id: task.id, title: newSubtaskTitle, status: 'pending', user_id: userId }
            ])
            .select();

        if (error) {
            console.error('Error adding subtask:', error);
        } else if (data) {
            setSubtasks([...subtasks, data[0]]);
            setNewSubtaskTitle('');
            router.refresh();
        }
    };

    const createParticles = () => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const particles: HTMLDivElement[] = [];

        for (let i = 0; i < 100; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.width = `${Math.random() * 8 + 4}px`;
            particle.style.height = particle.style.width;
            particle.style.left = `${Math.random() * rect.width + rect.left}px`;
            particle.style.top = `${Math.random() * rect.height + rect.top}px`;
            particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 400}px`);
            particle.style.setProperty('--ty', `${(Math.random() - 0.5) * 400}px`);
            particle.style.setProperty('--particle-color', getRandomColor());
            particles.push(particle);
            document.body.appendChild(particle);
        }

        setTimeout(() => {
            particles.forEach(p => p.remove());
        }, 1000);
    };

    const getRandomColor = () => {
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const handleDeleteTask = async () => {
        setIsDeleting(true);
        createParticles();

        setTimeout(async () => {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', task.id);

            if (error) {
                console.error('Error deleting task:', error);
                setIsDeleting(false);
            } else {
                onTaskDeleted(task.id);
            }
        }, 800);
    };

    const handleArchiveTask = async () => {
        setIsDeleting(true);
        createParticles();

        setTimeout(async () => {
            const { error } = await supabase.rpc('archive_task', { task_id: task.id });

            if (error) {
                console.error('Error archiving task:', error);
                setIsDeleting(false);
            } else {
                onTaskArchived(task.id);
            }
        }, 800);
    };

    return (
        <>
            <Card className={`mb-2 transition-all duration-200 ${isDeleting ? 'opacity-0 scale-95' : ''}`}>
                <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <div className="flex items-center space-x-2">
                            {/* Desktop buttons */}
                            <div className="hidden md:flex space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(true)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                {task.status === 'Completed' ? (
                                    <Button variant="ghost" size="sm" onClick={() => setIsArchiveDialogOpen(true)}>
                                        <Archive className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button variant="ghost" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            {/* Mobile dropdown */}
                            <div className="md:hidden">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => setIsExpanded(!isExpanded)}>
                                            {isExpanded ? 'Hide Details' : 'Show Details'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onSelect={() => setIsEditModalOpen(true)}>
                                            Edit Task
                                        </DropdownMenuItem>
                                        {task.status === 'Completed' ? (
                                            <DropdownMenuItem onSelect={() => setIsArchiveDialogOpen(true)}>
                                                Archive Task
                                            </DropdownMenuItem>
                                        ) : (
                                            <DropdownMenuItem onSelect={() => setIsDeleteDialogOpen(true)}>
                                                Delete Task
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                    {task.description && (
                        <p className="text-sm text-slate-400 mb-2">{task.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-2">
                        {task.tags && task.tags.map(tag => (
                            <Badge
                                key={tag.id}
                                style={{backgroundColor: tag.color_code, color: getContrastColor(tag.color_code)}}
                            >
                                {tag.name}
                            </Badge>
                        ))}
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                        <div className="flex justify-between items-center">
                            {task.priority && (
                                <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : task.priority === 'low' ? 'priority_low' : 'priority_none'}>
                                    {task.priority.toUpperCase()}
                                </Badge>
                            )}
                            <Badge className={`${getStatusColor(task.status)} text-white`}>
                                {task.status}
                            </Badge>
                        </div>
                        {task.due_date && (
                            <span className="text-xs text-gray-500">
                Due: {new Date(task.due_date).toLocaleDateString()}
              </span>
                        )}
                        {task.estimated_time !== null && task.estimated_time > 0 && (
                            <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                Estimated: {task.estimated_time} minutes
                            </div>
                        )}
                    </div>
                    {isExpanded && (
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold mb-2">Subtasks</h4>
                            {subtasks.map((subtask) => (
                                <div key={subtask.id} className="flex items-center mb-2">
                                    <Checkbox
                                        id={`subtask-${subtask.id}`}
                                        checked={subtask.status === 'completed'}
                                        onCheckedChange={(checked) =>
                                            handleSubtaskToggle(subtask.id, checked ? 'completed' : 'pending')
                                        }
                                    />
                                    <label
                                        htmlFor={`subtask-${subtask.id}`}
                                        className={`ml-2 text-sm ${subtask.status === 'completed' ? 'line-through text-gray-500' : ''}`}
                                    >
                                        {subtask.title}
                                    </label>
                                </div>
                            ))}
                            <div className="flex mt-2">
                                <Input
                                    type="text"
                                    placeholder="New subtask"
                                    value={newSubtaskTitle}
                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                    className="mr-2"
                                />
                                <Button onClick={handleAddSubtask}>Add</Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            <EditTaskModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onTaskUpdated={() => {
                    onTaskUpdated();
                    setIsEditModalOpen(false);
                }}
                task={task}
            />
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the task and all its subtasks.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteTask}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to archive this task?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will move the task to the archive. You can still access it later if needed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleArchiveTask}>Archive</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

