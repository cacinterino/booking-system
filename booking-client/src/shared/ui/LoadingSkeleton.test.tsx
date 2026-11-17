import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSkeleton } from './LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders with pulse animation', () => {
    render(<LoadingSkeleton />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('bg-ink/10');
  });

  it('applies custom className', () => {
    render(<LoadingSkeleton className="my-skeleton" />);
    const skeleton = screen.getByRole('generic');
    expect(skeleton).toHaveClass('my-skeleton');
  });
});
