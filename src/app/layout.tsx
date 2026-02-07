import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Toaster } from '@/components/ui/toaster';
import { VoiceAssistantProvider } from '@/context/voice-assistant-context';
import { VoiceAssistant } from '@/components/voice-assistant';
import { ThemeProvider } from '@/context/ThemeContext';
import { ParticleBackground } from '@/components/ParticleBackground';
import { ReminderEngine } from '@/components/reminders/ReminderEngine';

export const metadata: Metadata = {
  title: 'Chiranjeevani.AI',
  description: 'An AI-powered education & safety platform for pharmacy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider>
          <VoiceAssistantProvider>
            <ParticleBackground />
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
            <ReminderEngine />
          </VoiceAssistantProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
