import { PageShell } from "@/components/page-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageShell title="Admin Dashboard">
        {children}
    </PageShell>
  );
}
