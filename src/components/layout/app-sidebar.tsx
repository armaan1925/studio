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
          <span className="text-lg font-semibold">MediMind AI</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
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
