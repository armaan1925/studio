import { PageShell } from "@/components/page-shell";
import { Suspense } from "react";
import AssistantClient from "./assistant-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function AssistantLoading() {
  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hanuman Visual Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="aspect-video w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col gap-4">
            <div className="flex-grow h-[400px] border rounded-md" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 flex-grow" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <PageShell title="Hanuman AI Assistant">
      <div className="prose prose-stone dark:prose-invert max-w-none">
        <p>
          Interact with your personal AI assistant, Hanuman. You can chat via text or use your voice. The assistant is capable of understanding and responding in various Indian regional languages.
        </p>
      </div>
      <Suspense fallback={<AssistantLoading />}>
        <AssistantClient />
      </Suspense>
    </PageShell>
  );
}
