import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { VoiceAssistantProvider } from '@/context/voice-assistant-context';
import { VoiceAssistant } from '@/components/voice-assistant';

export const metadata: Metadata = {
  title: 'MediMind AI',
  description: 'An AI-powered education & safety platform for pharmacy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <VoiceAssistantProvider>
          <SidebarProvider>
            <Sidebar>
              <AppSidebar />
            </Sidebar>
            <SidebarInset>
              {children}
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
          <VoiceAssistant />
        </VoiceAssistantProvider>
      </body>
    </html>
  );
}
