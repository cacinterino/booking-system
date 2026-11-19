import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LoadingSkeleton } from './LoadingSkeleton';

function renderSkeleton(ui: React.ReactElement) {
  const { container } = render(ui);
  return container.firstElementChild as HTMLElement;
}

describe('LoadingSkeleton', () => {
  it('renders with pulse animation', () => {
    const skeleton = renderSkeleton(<LoadingSkeleton />);
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('bg-ink/10');
  });

  it('applies custom className', () => {
    const skeleton = renderSkeleton(<LoadingSkeleton className="my-skeleton" />);
    expect(skeleton).toHaveClass('my-skeleton');
  });
});
