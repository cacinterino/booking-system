import { forwardRef } from 'react';

export type BadgeVariant = 'brass' | 'sage' | 'slate' | 'red';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  brass: 'bg-brass/10 text-brass-deep border-brass/30',
  sage: 'bg-sage/15 text-sage border-sage/30',
  slate: 'bg-ink/5 text-slate border-line',
  red: 'bg-red-50 text-red-600 border-red-200',
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'brass', className, ...props }, ref) => {
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
