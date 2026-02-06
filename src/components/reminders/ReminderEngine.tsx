'use client';

import { useReminderEngine } from "@/hooks/use-reminder-engine";

/**
 * This is a global client component that activates the reminder engine hook.
 * It doesn't render any UI and is meant to be placed in the root layout.
 */
export function ReminderEngine() {
  useReminderEngine();
  return null;
}
