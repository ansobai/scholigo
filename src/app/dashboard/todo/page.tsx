'use client'

import { useState, useEffect } from 'react';
import TodoList from "@/components/todo/todo-list";
import CalendarView from "@/components/todo/todo-calendar";
import CreateTaskButton from "@/components/todo/create-task";
import ViewToggle from "@/components/todo/view-toggle";
import TaskDashboard from "@/components/todo/task-dashboard";
import { Task } from "@/types/todo";
import {createClient} from "@/utils/supabase/client";

export default function TodoPage() {
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [tasks, setTasks] = useState<Task[]>([]);
    const supabase = createClient()

    const fetchTasks = async () => {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
        *,
        subtasks (
          id,
          title,
          status,
          created_at
        ),
        tags (
          id,
          name,
          color_code
        )
      `).order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching tasks:', error);
        } else {
            setTasks(data || []);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleViewChange = (newView: 'list' | 'calendar') => {
        setView(newView);
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="scroll-m-20 pb-2 text-4xl font-semibold tracking-tight first:mt-0 text-lightYellow">
                TODO LIST
            </h2>
            <TaskDashboard tasks={tasks}/>
            <div className="flex justify-between items-center my-4">
                <div className="flex items-center space-x-4">
                    <CreateTaskButton onTaskCreated={fetchTasks} />
                    <ViewToggle view={view} onViewChange={handleViewChange} />
                </div>
            </div>
            {view === 'list' && (
                <TodoList initialTasks={tasks} onTasksChange={fetchTasks} />
            )}
            {view === 'calendar' && (
                <CalendarView tasks={tasks} />
            )}
        </div>
    );
}

