'use client';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  FlaskConical,
  LayoutDashboard,
  Pill,
  User,
  Bot,
  Camera,
  NotebookText,
  BellRing,
} from 'lucide-react';
import { UserNav } from './user-nav';

const menuItems = [
  {
    href: '/',
    label: 'Home',
    icon: LayoutDashboard,
  },
  {
    href: '/drug-information',
    label: 'Drug Information',
    icon: Pill,
  },
  {
    href: '/pill-recognition',
    label: 'Pill Recognition',
    icon: Camera,
  },
  {
    href: '/medical-summary',
    label: 'Medical Summary',
    icon: NotebookText,
  },
  {
    href: '/reminders',
    label: 'Reminders',
    icon: BellRing,
  },
  {
    href: '/learn',
    label: 'Learn',
    icon: BookOpen,
  },
  {
    href: '/research-hub',
    label: 'Research Hub',
    icon: FlaskConical,
  },
  {
    href: '/assistant',
    label: 'AI Assistant',
    icon: Bot,
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-8 text-primary" />
          <span className="text-lg font-semibold">Chiranjeevani.AI</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         {/* This is a placeholder for the user nav in a collapsed sidebar view. 
         For a full implementation, this might be handled differently. */}
        <div className="hidden group-data-[collapsible=icon]:block">
           <UserNav />
        </div>
      </SidebarFooter>
    </>
  );
}
