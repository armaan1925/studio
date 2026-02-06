import { cn } from '@/lib/utils';
import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

const futuristicButtonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20',
        secondary: 'bg-secondary/10 text-secondary-foreground border border-secondary/20 hover:bg-secondary/20',
        glow: 'border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20 hover:border-cyan-400/50',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface FuturisticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof futuristicButtonVariants> {
  asChild?: boolean;
}

const FuturisticButton = React.forwardRef<HTMLButtonElement, FuturisticButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(futuristicButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <span className="absolute -inset-full top-0 block -translate-y-full transform bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100" />
        <span className="relative">{children}</span>
      </Comp>
    );
  }
);
FuturisticButton.displayName = 'FuturisticButton';

export { FuturisticButton, futuristicButtonVariants };
