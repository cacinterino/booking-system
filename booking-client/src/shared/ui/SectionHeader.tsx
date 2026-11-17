import { forwardRef } from 'react';

export interface SectionHeaderProps {
  eyebrow: string;
  headline: string;
  description?: string;
  className?: string;
}

const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ eyebrow, headline, description, className }, ref) => {
    return (
      <div ref={ref} className={`mb-8 ${className ?? ''}`}>
        <p className="text-xs font-semibold text-brass-deep uppercase tracking-widest mb-2 font-mono">
          {eyebrow}
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink leading-tight mb-3">
          {headline}
        </h2>
        {description && <p className="text-slate leading-relaxed">{description}</p>}
      </div>
    );
  },
);

SectionHeader.displayName = 'SectionHeader';

export { SectionHeader };
