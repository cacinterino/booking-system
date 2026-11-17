import { forwardRef } from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider bg-brass/10 text-brass-deep border-brass/30 ${className ?? ''}`}
      {...props}
    />
  );
});

Badge.displayName = 'Badge';

export { Badge };
