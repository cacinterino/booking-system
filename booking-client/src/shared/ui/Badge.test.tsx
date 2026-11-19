import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('has pill shape and brass styling', () => {
    render(<Badge>Active</Badge>);
    const badge = screen.getByText('Active');
    expect(badge).toHaveClass('rounded-full');
    expect(badge).toHaveClass('bg-brass/10');
    expect(badge).toHaveClass('text-brass-deep');
    expect(badge).toHaveClass('font-mono');
    expect(badge).toHaveClass('text-xs');
    expect(badge).toHaveClass('uppercase');
  });

  it('switches colour for the sage variant', () => {
    render(<Badge variant="sage">Active</Badge>);
    const badge = screen.getByText('Active');
    expect(badge).toHaveClass('text-sage');
  });

  it('applies custom className', () => {
    render(<Badge className="my-badge">Active</Badge>);
    const badge = screen.getByText('Active');
    expect(badge).toHaveClass('my-badge');
  });
});
