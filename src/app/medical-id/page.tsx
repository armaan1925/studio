import { PageShell } from "@/components/page-shell";
import MedicalIdClient from "./medical-id-client";
import { Suspense } from "react";

export default function MedicalIdPage() {
  return (
    <PageShell title="Medical ID">
      <Suspense fallback={<div className="text-center p-8">Loading Medical ID...</div>}>
        <MedicalIdClient />
      </Suspense>
    </PageShell>
  );
}
