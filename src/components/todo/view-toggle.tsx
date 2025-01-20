'use client'

import { Button } from "@/components/ui/button";
import { ListIcon, CalendarIcon } from 'lucide-react';

interface ViewToggleProps {
    view: 'list' | 'calendar';
    onViewChange: (view: 'list' | 'calendar') => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div className="flex space-x-2">
            <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewChange('list')}
            >
                <ListIcon className="w-4 h-4 mr-2" />
                List
            </Button>
            <Button
                variant={view === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewChange('calendar')}
            >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Calendar
            </Button>
        </div>
    );
}

