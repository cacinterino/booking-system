import { forwardRef } from 'react';

export interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const LoadingSkeleton = forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`animate-pulse bg-ink/10 rounded-lg ${className ?? ''}`}
        {...props}
      />
    );
  },
);

LoadingSkeleton.displayName = 'LoadingSkeleton';

export { LoadingSkeleton };
