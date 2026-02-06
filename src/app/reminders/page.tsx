import { PageShell } from "@/components/page-shell";
import RemindersClient from "./reminders-client";

export default function RemindersPage() {
  return (
    <PageShell title="Medicine Reminders">
      <div className="prose prose-stone dark:prose-invert max-w-none">
        <p>
          Manage your medicine schedule here. The app will automatically send you notifications and voice alerts when it's time to take your medicine.
        </p>
      </div>
      <RemindersClient />
    </PageShell>
  );
}
