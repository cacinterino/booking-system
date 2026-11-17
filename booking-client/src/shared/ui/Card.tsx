import { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-paper-white border border-line rounded-lg p-6 md:p-8 shadow-sm transition-all hover:shadow-md ${className ?? ''}`}
      {...props}
    />
  );
});

Card.displayName = 'Card';

export { Card };
