import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wide transition-all',
  {
    variants: {
      variant: {
        default: 'bg-amber-500/10 border border-amber-500/20 text-amber-400',
        blue:    'bg-blue-500/10 border border-blue-500/20 text-blue-400',
        green:   'bg-green-500/10 border border-green-500/20 text-green-400',
        red:     'bg-red-500/10 border border-red-500/20 text-red-400',
        ghost:   'bg-white/[0.04] border border-white/[0.08] text-white/40',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
