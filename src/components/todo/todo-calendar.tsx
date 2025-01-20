'use client'

import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import {format} from 'date-fns/format';
import {parse} from 'date-fns/parse';
import {startOfWeek} from 'date-fns/startOfWeek';
import {getDay} from 'date-fns/getDay';
import {enUS} from 'date-fns/locale/en-US';
import { Task } from '@/types/todo';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarViewProps {
    tasks: Task[];
}

export default function CalendarView({ tasks }: CalendarViewProps) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [date, setDate] = useState(new Date())

    const events = tasks.map(task => ({
        id: task.id,
        title: task.title,
        start: task.due_date ? new Date(task.due_date) : new Date(task.created_at),
        end: task.due_date ? new Date(task.due_date) : new Date(task.created_at),
        allDay: true,
        resource: task,
    }));

    const handleSelectEvent = (event: any) => {
        setSelectedTask(event.resource);
    };

    return (
        <div className="h-[600px]">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={handleSelectEvent}
                views={['month']}
                date={date}
                onNavigate={(newDate) => setDate(newDate)}
            />
            {selectedTask && (
                <div className="mt-4 p-4 border rounded-md">
                    <h3 className="text-lg font-semibold">{selectedTask.title}</h3>
                    <p className="text-sm text-gray-600">{selectedTask.description}</p>
                    <p className="text-sm">Status: {selectedTask.status}</p>
                    <p className="text-sm">Priority: {selectedTask.priority?.toUpperCase()}</p>
                    <p className="text-sm">
                        {selectedTask.due_date
                            ? `Due: ${new Date(selectedTask.due_date).toLocaleDateString()}`
                            : `Created: ${new Date(selectedTask.created_at).toLocaleDateString()}`
                        }
                    </p>
                </div>
            )}
        </div>
    );
}

