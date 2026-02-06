'use client';

import type { Reminder } from '@/lib/reminders';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Bell, BellOff, Clock, Edit, Pill, StickyNote, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { differenceInDays, format, isBefore, isToday } from 'date-fns';

interface ReminderCardProps {
    reminder: Reminder;
    onToggle: (id: string, active: boolean) => void;
    onDelete: (id: string) => void;
    isDemo?: boolean;
}

export default function ReminderCard({ reminder, onToggle, onDelete, isDemo }: ReminderCardProps) {
    
    const startDate = new Date(reminder.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + reminder.durationDays);

    const isExpired = isBefore(endDate, new Date()) && !isToday(endDate);
    const daysRemaining = differenceInDays(endDate, new Date());

    const status = isDemo ? (reminder.active ? 'active' : 'inactive') : (isExpired ? 'expired' : (reminder.active ? 'active' : 'inactive'));

    return (
        <Card className={cn(
            'transition-all', 
            status === 'inactive' && 'bg-muted/50 border-dashed',
            status === 'expired' && 'opacity-60 bg-muted/30'
        )}>
            <CardHeader>
                <div className='flex justify-between items-start'>
                    <div>
                        <CardTitle className='text-lg'>{reminder.medicineName}</CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Pill className='size-3'/> {reminder.dosage}
                        </p>
                    </div>
                     <Badge variant={status === 'active' ? 'default' : 'secondary'} className={cn(status === 'active' && 'bg-green-600')}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                 <div className="flex flex-wrap gap-2">
                    {reminder.timings.map(time => (
                        <Badge key={time} variant="outline" className='flex items-center gap-1.5'>
                            <Clock className='size-3'/> {format(new Date(`1970-01-01T${time}`), 'h:mm a')}
                        </Badge>
                    ))}
                 </div>
                 {reminder.notes && (
                    <p className="text-sm text-muted-foreground italic flex items-start gap-2">
                        <StickyNote className='size-4 mt-0.5 shrink-0'/>
                        <span>{reminder.notes}</span>
                    </p>
                 )}
                 <div>
                    <p className="text-xs text-muted-foreground">
                        Duration: {reminder.durationDays} days
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {status === 'expired' ? `Ended on ${format(endDate, 'MMM d, yyyy')}` : (daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Last day')}
                    </p>
                 </div>
            </CardContent>
            <CardFooter className='flex justify-between items-center bg-muted/30 py-3 px-4'>
                <div className='flex items-center gap-2'>
                   <Switch
                        checked={reminder.active && !isExpired}
                        onCheckedChange={(checked) => onToggle(reminder.id, checked)}
                        disabled={isDemo || isExpired}
                    />
                    <label className='text-sm font-medium flex items-center gap-1.5'>
                        {reminder.active ? <Bell className='size-4'/> : <BellOff className='size-4'/>}
                        Notifications
                    </label>
                </div>
                <div className='flex items-center gap-2'>
                    <Button variant="ghost" size="icon" className='size-8' disabled={isDemo}>
                        <Edit className='size-4'/>
                    </Button>
                     <Button variant="ghost" size="icon" className='size-8 text-destructive' onClick={() => onDelete(reminder.id)} disabled={isDemo}>
                        <Trash2 className='size-4'/>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
