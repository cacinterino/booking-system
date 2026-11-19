import { forwardRef } from 'react';

export type BadgeVariant = 'brass' | 'sage' | 'slate' | 'danger';

const variantStyles: Record<BadgeVariant, string> = {
  brass: 'bg-brass/10 text-brass-deep border-brass/30',
  sage: 'bg-sage/10 text-sage border-sage/30',
  slate: 'bg-slate/10 text-slate border-slate/30',
  danger: 'bg-red-600/10 text-red-700 border-red-600/30',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  variant?: BadgeVariant;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'brass', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider ${variantStyles[variant]} ${className ?? ''}`}
        {...props}
      />
    );
  },
);

Badge.displayName = 'Badge';

export { Badge };
