import { PageShell } from "@/components/page-shell";
import PillRecognitionClient from "./pill-recognition-client";

export default function PillRecognitionPage() {
  return (
    <PageShell title="Pill Recognition">
      <div className="prose prose-stone dark:prose-invert max-w-none">
        <p>
          Use your device's camera to take a picture of a pill. The AI will try to identify it and provide detailed information.
          This feature is for informational purposes only and is not a substitute for professional medical advice.
        </p>
      </div>
      <PillRecognitionClient />
    </PageShell>
  );
}
