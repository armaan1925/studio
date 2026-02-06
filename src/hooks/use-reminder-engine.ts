'use client';
import { useEffect, useState } from 'react';
import { getReminders } from '@/lib/reminders';
import { useSpeechSynthesis } from './use-speech-synthesis';
import { useToast } from './use-toast';

export const useReminderEngine = () => {
  const [lastCheckedMinute, setLastCheckedMinute] = useState<number | null>(null);
  const { speak } = useSpeechSynthesis();
  const { toast } = useToast();

  useEffect(() => {
    const checkPermissions = async () => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission !== 'granted') {
          // You might want to prompt the user here, e.g., in a settings page
          // For now, we'll just log it. A button in the UI is better for this.
          console.log('Notification permission has not been granted.');
        }
      }
    };
    checkPermissions();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentMinute = now.getHours() * 60 + now.getMinutes();

      if (currentMinute !== lastCheckedMinute) {
        setLastCheckedMinute(currentMinute);
        const reminders = getReminders();
        const activeReminders = reminders.filter(r => r.active);

        for (const reminder of activeReminders) {
          const reminderStartDate = new Date(reminder.startDate);
          const reminderEndDate = new Date(reminderStartDate);
          reminderEndDate.setDate(reminderEndDate.getDate() + reminder.durationDays);

          if (now >= reminderStartDate && now <= reminderEndDate) {
            for (const time of reminder.timings) {
              const [hours, minutes] = time.split(':').map(Number);
              if (now.getHours() === hours && now.getMinutes() === minutes) {
                // Time to trigger reminder!
                const title = "Medicine Reminder";
                const body = `Time to take your ${reminder.medicineName} (${reminder.dosage}).`;

                // Browser notification
                if (Notification.permission === 'granted') {
                  new Notification(title, {
                    body,
                    icon: '/icon.png', // Make sure you have an icon in your public folder
                  });
                } else {
                  // Fallback to toast if notifications are denied
                   toast({ title, description: body });
                }

                // Voice alert
                speak(body);
              }
            }
          }
        }
      }
    }, 15 * 1000); // Check every 15 seconds for more precision without being too aggressive

    return () => clearInterval(interval);
  }, [lastCheckedMinute, speak, toast]);

  // This hook is for background work and doesn't need to return anything for the UI.
};
