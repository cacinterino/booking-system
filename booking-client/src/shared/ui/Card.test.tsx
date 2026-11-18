import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('has paper-white background and hairline border', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Card content').parentElement!;
    expect(card).toHaveClass('bg-paper-white');
    expect(card).toHaveClass('border-line');
  });

  it('is flat at rest (shadow-sm)', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Card content').parentElement!;
    expect(card).toHaveClass('shadow-sm');
  });

  it('applies custom className', () => {
    render(<Card className="my-card">Content</Card>);
    const card = screen.getByText('Content').parentElement!;
    expect(card).toHaveClass('my-card');
  });
});
