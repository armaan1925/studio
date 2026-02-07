'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons';
import { UserNav } from '@/components/layout/user-nav';
import { cn } from '@/lib/utils';
import { SidebarTrigger } from './ui/sidebar';

export function Navbar({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-white/10 bg-background/50 backdrop-blur-lg',
        className
      )}
    >
      <div className="container mx-auto flex h-16 items-center px-4 sm:px-6">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="size-6 text-primary" />
            <span className="font-bold">Chiranjeevani.AI</span>
          </Link>
        </div>
        
        {/* For mobile view, we integrate the sidebar trigger */}
        <SidebarTrigger className="md:hidden" />
        <div className="h-8 w-px bg-border md:hidden mx-4" />
        <h1 className="text-xl font-semibold tracking-tight md:hidden">Chiranjeevani.AI</h1>
        
        <div className="ml-auto flex items-center gap-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
