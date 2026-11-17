import { forwardRef } from 'react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ title, description, action, icon, className }, ref) => {
    return (
      <div ref={ref} className={`text-center py-12 ${className ?? ''}`}>
        {icon && <div className="mx-auto mb-4">{icon}</div>}
        <h3 className="font-display text-xl font-semibold text-ink mb-2">{title}</h3>
        {description && (
          <p className="mx-auto max-w-sm text-slate text-sm leading-relaxed mb-6">
            {description}
          </p>
        )}
        {action && <div className="justify-center">{action}</div>}
      </div>
    );
  },
);

EmptyState.displayName = 'EmptyState';

export { EmptyState };
