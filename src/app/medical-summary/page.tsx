import { PageShell } from "@/components/page-shell";
import MedicalSummaryClient from "./medical-summary-client";

export default function MedicalSummaryPage() {
  return (
    <PageShell title="Medical Summary">
      <div className="prose prose-stone dark:prose-invert max-w-none">
        <p>
          Use our AI-powered scanners to easily understand your prescriptions and medicines. 
          Capture or upload an image to get a simplified summary in your chosen language.
        </p>
      </div>
      <MedicalSummaryClient />
    </PageShell>
  );
}
