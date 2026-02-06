import { cn } from '@/lib/utils';
import React from 'react';

const FuturisticCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'group relative overflow-hidden rounded-lg border border-white/10 bg-black/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/50 hover:bg-black/50',
        className
      )}
      {...props}
    >
      <div className="absolute -top-1/2 -right-1/2 h-full w-full bg-gradient-to-tr from-transparent via-cyan-500/10 to-purple-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
);
FuturisticCard.displayName = 'FuturisticCard';

export { FuturisticCard };
