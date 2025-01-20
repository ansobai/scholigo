'use client'

import {useState, useEffect, useRef} from 'react';
import { Task } from "@/types/todo";
import TaskCard from "@/components/todo/task-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TaskFilters, TaskFilters as TaskFiltersType } from "@/components/todo/task-filters";
import { AnimatePresence, motion } from "framer-motion";
import {createClient} from "@/utils/supabase/client";
import {DragDropContext, Draggable, Droppable, DropResult} from "@hello-pangea/dnd";

interface TodoListProps {
    initialTasks: Task[];
    onTasksChange: () => void;
}

const statusColumns = ['Not started', 'In Progress', 'Pending', 'Completed'];

type SortOption = 'dueDate' | 'priority' | 'status';

export default function TodoList({ initialTasks, onTasksChange }: TodoListProps) {
    const userId = useRef<string | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('dueDate');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filters, setFilters] = useState<TaskFiltersType>({
        search: '',
        priority: 'all',
        status: 'all',
        dateRange: undefined,
    });
    const supabase = createClient()

    useEffect(() => {
        fetchUserId();
    }, []);

    useEffect(() => {
        setTasks(initialTasks);
        sortTasks(sortBy);
    }, [initialTasks, sortBy]);

    const fetchUserId = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            userId.current = user.id;
        }
    }

    const sortTasks = (option: SortOption) => {
        const sortedTasks = [...initialTasks].sort((a, b) => {
            switch (option) {
                case 'dueDate':
                    return (a.due_date ? new Date(a.due_date).getTime() : Infinity) -
                        (b.due_date ? new Date(b.due_date).getTime() : Infinity);
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1, none: 0 };
                    return (priorityOrder[b.priority || 'none'] || 0) - (priorityOrder[a.priority || 'none'] || 0);
                case 'status':
                    const statusOrder = { 'Not started': 0, 'In Progress': 1, 'Pending': 2, 'Completed': 3 };
                    return statusOrder[a.status] - statusOrder[b.status];
                default:
                    return 0;
            }
        });
        setTasks(sortedTasks);
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId as Task['status'];
        const taskId = parseInt(draggableId);

        const newTasks = Array.from(tasks);
        const [reorderedTask] = newTasks.splice(newTasks.findIndex(task => task.id === taskId), 1);
        reorderedTask.status = newStatus;

        const insertIndex = newTasks.filter(task => task.status === newStatus).length;
        newTasks.splice(newTasks.findIndex(task => task.status === newStatus) + insertIndex, 0, reorderedTask);

        setTasks(newTasks);

        const { error } = await supabase
            .from('tasks')
            .update({ status: newStatus })
            .eq('id', taskId);

        if (error) {
            console.error('Error updating task:', error);
            setTasks(tasks);
        } else {
            onTasksChange();
        }
    };

    const handleTaskDeleted = (taskId: number) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        onTasksChange();
    };

    const handleTaskArchived = (taskId: number) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        onTasksChange();
    };

    const handleFilterChange = (newFilters: TaskFiltersType) => {
        setFilters(newFilters);
    };

    const filteredTasks = tasks.filter(task => {
        if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
            (!task.description || !task.description.toLowerCase().includes(filters.search.toLowerCase()))) {
            return false;
        }
        if (filters.priority !== 'all' && task.priority !== filters.priority) {
            return false;
        }
        if (filters.status !== 'all' && task.status !== filters.status) {
            return false;
        }
        if (filters.dateRange && filters.dateRange.from && task.due_date) {
            const dueDate = new Date(task.due_date);
            if (dueDate < filters.dateRange.from) return false;
            if (filters.dateRange.to && dueDate > filters.dateRange.to) return false;
        }
        return true;
    });

    if (!tasks || tasks.length === 0) {
        return <div className="text-center py-4">No tasks found. Create a new task to get started!</div>;
    }

    return (
        <>
            <div className="mb-4">
                <Button
                    onClick={() => setIsFilterVisible(!isFilterVisible)}
                    variant="outline"
                    className="w-full justify-between"
                >
                    {isFilterVisible ? 'Hide' : 'Show'} Filters and Sort Options
                    {isFilterVisible ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                </Button>
                <AnimatePresence>
                    {isFilterVisible && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 space-y-4">
                                <div>
                                    <Label htmlFor="sort-select">Sort by:</Label>
                                    <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                                        <SelectTrigger id="sort-select">
                                            <SelectValue placeholder="Select sort option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dueDate">Due Date</SelectItem>
                                            <SelectItem value="priority">Priority</SelectItem>
                                            <SelectItem value="status">Status</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <TaskFilters onFilterChange={handleFilterChange} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100vh-8rem)]">
                    {statusColumns.map((status) => (
                        <div key={status} className="bg-blue-950 border-2 border-darkBlue p-4 rounded-lg h-[calc(100vh-8rem)] flex flex-col">
                            <h2 className="text-xl font-semibold mb-4">{status}</h2>
                            <Droppable droppableId={status}>
                                {(provided, snapshot) => (
                                    <ScrollArea className="h-[calc(100vh-12rem)]">
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="space-y-4 min-h-[50px]"
                                        >
                                            {filteredTasks
                                                .filter((task) => task.status === status)
                                                .map((task, index) => (
                                                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="task-card-container"
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    transform: snapshot.isDragging
                                                                        ? provided.draggableProps.style?.transform
                                                                        : 'translate(0, 0)',
                                                                }}
                                                            >
                                                                <div
                                                                    className={`task-card ${
                                                                        snapshot.isDragging ? 'shadow-lg' : ''
                                                                    }`}
                                                                >
                                                                    <TaskCard
                                                                        userId={userId.current}
                                                                        task={task}
                                                                        onTaskUpdated={onTasksChange}
                                                                        onTaskDeleted={handleTaskDeleted}
                                                                        onTaskArchived={handleTaskArchived}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                            {provided.placeholder}
                                        </div>
                                    </ScrollArea>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </>
    );
}

