import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:pointer-events-none disabled:opacity-40 active:scale-95',
  {
    variants: {
      variant: {
        default:  'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5',
        ghost:    'bg-white/[0.03] border border-white/[0.07] text-white/50 hover:bg-white/[0.07] hover:text-white/80 hover:border-white/[0.12]',
        outline:  'border border-white/[0.1] bg-transparent text-white/60 hover:bg-white/[0.05] hover:text-white hover:border-white/20',
        danger:   'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/35',
        success:  'bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 hover:border-green-500/35',
      },
      size: {
        sm:   'h-8 px-3 text-xs rounded-lg',
        md:   'h-9 px-4',
        lg:   'h-11 px-6 text-base rounded-xl',
        icon: 'h-8 w-8 rounded-lg p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean; }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
