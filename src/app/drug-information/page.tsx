import { PageShell } from "@/components/page-shell";
import DrugSearchClient from "./drug-search-client";

export default function DrugInformationPage() {
  // The initial summary generation was removed to prevent exceeding API rate limits on page load.
  // The user can generate a summary by clicking the button.
  return (
    <PageShell title="Drug Information">
        <div className="prose prose-stone dark:prose-invert max-w-none">
            <p>
                Use the form below to get a concise, AI-generated summary of a drug's key information. 
                This tool is powered by generative AI to help you quickly understand uses, dosage, contraindications, and warnings.
                The form is pre-filled with an example.
            </p>
        </div>
        <DrugSearchClient />
    </PageShell>
  );
}
