import {Tag} from "@/types/tag";

export interface Subtask {
    id: number;
    task_id: number;
    title: string;
    status: 'pending' | 'completed';
    created_at: string;
}

export interface Task {
    id: number;
    title: string;
    description?: string;
    priority?: 'high' | 'medium' | 'low';
    due_date?: string;
    created_at: string;
    updated_at: string;
    status: 'Not started' | 'Pending' | 'Completed' | 'In Progress';
    estimated_time: number | null;
    subtasks?: Subtask[];
    tags?: Tag[];
}

