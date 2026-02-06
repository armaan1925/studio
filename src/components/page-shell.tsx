'use client';

import { cn } from "@/lib/utils";
import { SidebarTrigger } from "./ui/sidebar";
import { UserNav } from "./layout/user-nav";
import { usePathname } from "next/navigation";
import { AIDisclaimer } from "./AIDisclaimer";

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
}

export function PageShell({ children, title, className, ...props }: PageShellProps) {
  const pathname = usePathname();
  
  // The disclaimer should not appear on the Home page ('/') or the Profile page ('/profile').
  // The Home page doesn't use PageShell, so we only need to check for the profile page here.
  const showDisclaimer = pathname !== '/profile';

  return (
    <div className="flex h-full flex-col">
       <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <SidebarTrigger className="md:hidden" />
        <div className="h-8 w-px bg-border md:hidden" />
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <div className="ml-auto hidden md:block">
          <UserNav />
        </div>
      </header>
      {showDisclaimer && <AIDisclaimer />}
      <div className={cn("p-4 sm:p-6", className)} {...props}>
        {children}
      </div>
    </div>
  );
}
