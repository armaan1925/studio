import { cn } from '@/lib/utils';
import React from 'react';

const FuturisticPanel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-xl border border-white/10 bg-black/20 p-8 shadow-2xl shadow-black/50 backdrop-blur-lg',
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-gray-950/30 to-black/50" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
);
FuturisticPanel.displayName = 'FuturisticPanel';

export { FuturisticPanel };
