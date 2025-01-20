'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Task } from "@/types/todo";

interface TaskDashboardProps {
    tasks: Task[];
}

export default function TaskDashboard({ tasks } : TaskDashboardProps) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const statusCounts = {
        'Not started': tasks.filter(task => task.status === 'Not started').length,
        'In progress': tasks.filter(task => task.status === 'In Progress').length,
        'Pending': tasks.filter(task => task.status === 'Pending').length,
        'Completed': completedTasks,
    };

    const upcomingTasks = tasks
        .filter(task => task.due_date && new Date(task.due_date) > new Date())
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
        .slice(0, 5);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-medium text-lightYellow">Total Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalTasks}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-medium text-lightYellow">Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{overallProgress}%</div>
                    <Progress value={overallProgress} className="mt-2" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-medium text-lightYellow">Task Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm">
                        {Object.entries(statusCounts).map(([status, count]) => (
                            <div key={status} className="flex justify-between mt-1">
                                <span>{status}:</span>
                                <span>{count}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-2xl font-medium text-lightYellow">Upcoming Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm">
                        {upcomingTasks.map(task => (
                            <div key={task.id} className="mt-1">
                                <span>{task.title} - </span>
                                <span className="text-muted-foreground">
                  {new Date(task.due_date!).toLocaleDateString()}
                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

