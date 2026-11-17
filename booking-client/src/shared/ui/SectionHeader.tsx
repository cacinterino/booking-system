import { forwardRef } from 'react';

export interface SectionHeaderProps {
  eyebrow: string;
  headline: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ eyebrow, headline, description, className, children }, ref) => {
    return (
      <div ref={ref} className={`mb-8 ${className ?? ''}`}>
        <p className="text-xs font-semibold text-brass-deep uppercase tracking-widest mb-1.5 font-mono">
          {eyebrow}
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink leading-tight">
              {headline}
            </h2>
            {description && <p className="text-slate text-sm sm:text-base mt-1.5 max-w-2xl">{description}</p>}
          </div>
          {children && <div>{children}</div>}
        </div>
      </div>
    );
  },
);

SectionHeader.displayName = 'SectionHeader';

export { SectionHeader };
