'use client';

import { v4 as uuidv4 } from 'uuid';
import type { MedicineInfo } from '@/ai/flows/summarize-prescription-flow';

const REMINDERS_STORAGE_KEY = 'medicineReminders';

export type Reminder = {
  id: string;
  medicineName: string;
  dosage: string;
  timings: string[]; // e.g., ['09:00', '21:00']
  startDate: string;
  durationDays: number;
  notes: string;
  active: boolean;
};

// --- Helper Functions ---

const timeStringToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const timingToTime = (timing: string): string => {
    switch (timing.toLowerCase()) {
        case 'morning': return '09:00';
        case 'afternoon': return '14:00';
        case 'evening': return '19:00';
        case 'night': return '21:00';
        default: return '09:00';
    }
};

const parseDuration = (duration: string): number => {
    const match = duration.match(/(\d+)\s*(day|week|month)s?/i);
    if (!match) return 7; // Default to 7 days
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    if (unit === 'week') return value * 7;
    if (unit === 'month') return value * 30;
    return value;
};


// --- Main Service Functions ---

export const getReminders = (): Reminder[] => {
  if (typeof window === 'undefined') return [];
  try {
    const storedReminders = localStorage.getItem(REMINDERS_STORAGE_KEY);
    return storedReminders ? JSON.parse(storedReminders) : [];
  } catch (error) {
    console.error("Failed to parse reminders from localStorage", error);
    return [];
  }
};

export const saveReminders = (reminders: Reminder[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.error("Failed to save reminders to localStorage", error);
  }
};

export const addReminder = (reminder: Omit<Reminder, 'id'>): void => {
  const newReminder: Reminder = { ...reminder, id: uuidv4() };
  const reminders = getReminders();
  saveReminders([...reminders, newReminder]);
};

export const addRemindersFromMedicines = (medicines: MedicineInfo[]): void => {
    const existingReminders = getReminders();
    const newReminders: Reminder[] = medicines.map(med => ({
        id: uuidv4(),
        medicineName: med.name,
        dosage: med.dosage,
        timings: med.timing.map(timingToTime).sort((a,b) => timeStringToMinutes(a) - timeStringToMinutes(b)),
        startDate: new Date().toISOString(),
        durationDays: parseDuration(med.duration),
        notes: med.notes,
        active: true
    }));
    saveReminders([...existingReminders, ...newReminders]);
};

export const updateReminder = (updatedReminder: Reminder): void => {
  const reminders = getReminders();
  const updatedList = reminders.map(r => r.id === updatedReminder.id ? updatedReminder : r);
  saveReminders(updatedList);
};

export const deleteReminder = (reminderId: string): void => {
  const reminders = getReminders();
  const filteredList = reminders.filter(r => r.id !== reminderId);
  saveReminders(filteredList);
};
