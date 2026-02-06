import { PageShell } from "@/components/page-shell";
import AssistantClient from "./assistant-client";

export default function AssistantPage() {
  return (
    <PageShell title="AI Assistant">
      <div className="prose prose-stone dark:prose-invert max-w-none">
        <p>
          Interact with your personal AI assistant. You can chat via text or use your voice. The assistant is capable of understanding and responding in various Indian regional languages.
        </p>
      </div>
      <AssistantClient />
    </PageShell>
  );
}
