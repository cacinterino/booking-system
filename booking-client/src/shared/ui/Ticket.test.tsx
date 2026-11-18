import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Ticket } from './Ticket';

describe('Ticket', () => {
  it('renders children', () => {
    render(<Ticket>Ticket content</Ticket>);
    expect(screen.getByText('Ticket content')).toBeInTheDocument();
  });

  it('has rotate-1 at rest', () => {
    render(<Ticket>Content</Ticket>);
    const ticket = screen.getByText('Content').parentElement!;
    expect(ticket).toHaveClass('rotate-1');
  });

  it('has paper-white background and hairline border', () => {
    render(<Ticket>Content</Ticket>);
    const ticket = screen.getByText('Content').parentElement!;
    expect(ticket).toHaveClass('bg-paper-white');
    expect(ticket).toHaveClass('border-line');
  });

  it('applies custom className', () => {
    render(<Ticket className="my-ticket">Content</Ticket>);
    const ticket = screen.getByText('Content').parentElement!;
    expect(ticket).toHaveClass('my-ticket');
  });
});
