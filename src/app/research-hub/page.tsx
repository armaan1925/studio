import { PageShell } from "@/components/page-shell";
import { ResearchFormClient } from "./research-form-client";

export default function ResearchHubPage() {
  return (
    <PageShell title="Research Hub">
        <div className="prose prose-stone dark:prose-invert max-w-none">
            <p>
                Showcase your work and connect with the industry. Paste your research paper's abstract and your interests below. 
                Our AI will analyze the content and suggest related research papers and potential mentors to guide you.
            </p>
        </div>
        <ResearchFormClient />
    </PageShell>
  );
}
