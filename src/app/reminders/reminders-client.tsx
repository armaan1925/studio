'use client';

import { useEffect, useState } from 'react';
import { getReminders, saveReminders, type Reminder } from '@/lib/reminders';
import { mockReminders } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BellRing, PlusCircle } from 'lucide-react';
import ReminderList from '@/components/reminders/ReminderList';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function RemindersClient() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const loadedReminders = getReminders();
    setReminders(loadedReminders);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasNotificationPermission(Notification.permission === 'granted');
    }
  }, [])

  const handleToggleReminder = (id: string, active: boolean) => {
    const updatedReminders = reminders.map(r => r.id === id ? { ...r, active } : r);
    setReminders(updatedReminders);
    saveReminders(updatedReminders);
  };

  const handleDeleteReminder = (id: string) => {
    const updatedReminders = reminders.filter(r => r.id !== id);
    setReminders(updatedReminders);
    saveReminders(updatedReminders);
  };

  const requestNotificationPermission = () => {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        setHasNotificationPermission(true);
      }
    });
  }

  const hasActiveReminders = reminders.some(r => r.active);
  const showMockData = !isLoading && reminders.length === 0;

  return (
    <div className="mt-6 space-y-6">
      {hasNotificationPermission === false && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Enable Notifications</AlertTitle>
          <AlertDescription className='flex items-center justify-between'>
            To receive medicine reminders, please allow notifications.
            <Button onClick={requestNotificationPermission} size="sm">Allow Notifications</Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className='flex-row items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <BellRing className='text-primary' />
            My Reminder Schedule
          </CardTitle>
          <Button variant="outline" size="sm">
            <PlusCircle className='mr-2' /> Add Reminder
          </Button>
        </CardHeader>
        <CardContent>
          {showMockData ? (
            <div className='text-center py-8'>
                <p className='text-muted-foreground mb-4'>You have no reminders set. Here is a demo of what your dashboard will look like.</p>
                <ReminderList 
                    reminders={mockReminders} 
                    onToggle={handleToggleReminder} 
                    onDelete={handleDeleteReminder}
                    isDemo={true}
                />
            </div>
          ) : (
            <ReminderList 
                reminders={reminders} 
                onToggle={handleToggleReminder} 
                onDelete={handleDeleteReminder}
            />
          )}
           {!hasActiveReminders && !showMockData && (
              <p className="text-center text-muted-foreground py-8">
                  All your reminders are currently inactive.
              </p>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
