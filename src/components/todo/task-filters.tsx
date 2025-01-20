'use client'

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface TaskFiltersProps {
    onFilterChange: (filters: TaskFilters) => void;
}

export interface TaskFilters {
    search: string;
    priority: string;
    status: string;
    dateRange: DateRange | undefined;
}

export function TaskFilters({ onFilterChange }: TaskFiltersProps) {
    const [filters, setFilters] = useState<TaskFilters>({
        search: '',
        priority: 'all',
        status: 'all',
        dateRange: undefined,
    });

    useEffect(() => {
        onFilterChange(filters);
    }, [filters, onFilterChange]);

    const handleFilterChange = (key: keyof TaskFilters, value: any) => {
        setFilters(prevFilters => ({ ...prevFilters, [key]: value }));
    };

    return (
        <div className="space-y-4">
            <Input
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="priority-filter">Priority</Label>
                    <Select
                        value={filters.priority}
                        onValueChange={(value) => handleFilterChange('priority', value)}
                    >
                        <SelectTrigger id="priority-filter">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="status-filter">Status</Label>
                    <Select
                        value={filters.status}
                        onValueChange={(value) => handleFilterChange('status', value)}
                    >
                        <SelectTrigger id="status-filter">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="Not started">Not started</SelectItem>
                            <SelectItem value="in progress">In progress</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div>
                <Label>Due Date Range</Label>
                <DatePickerWithRange
                    date={filters.dateRange}
                    setDate={(date) => handleFilterChange('dateRange', date)}
                />
            </div>
            <Button
                variant="outline"
                onClick={() => {
                    const resetFilters = {
                        search: '',
                        priority: 'all',
                        status: 'all',
                        dateRange: undefined,
                    };
                    setFilters(resetFilters);
                }}
                className="w-full"
            >
                Reset Filters
            </Button>
        </div>
    );
}

