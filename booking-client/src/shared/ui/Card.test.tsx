import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

function renderCard(ui: React.ReactElement) {
  const { container } = render(ui);
  return container.firstElementChild as HTMLElement;
}

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('has paper-white background and hairline border', () => {
    const card = renderCard(<Card>Content</Card>);
    expect(card).toHaveClass('bg-paper-white');
    expect(card).toHaveClass('border-line');
  });

  it('is flat at rest (shadow-sm)', () => {
    const card = renderCard(<Card>Content</Card>);
    expect(card).toHaveClass('shadow-sm');
  });

  it('applies custom className', () => {
    const card = renderCard(<Card className="my-card">Content</Card>);
    expect(card).toHaveClass('my-card');
  });
});
