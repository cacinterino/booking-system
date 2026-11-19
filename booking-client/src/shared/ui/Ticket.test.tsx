import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Ticket } from './Ticket';

function renderTicket(ui: React.ReactElement) {
  const { container } = render(ui);
  return container.firstElementChild as HTMLElement;
}

describe('Ticket', () => {
  it('renders children', () => {
    render(<Ticket>Ticket content</Ticket>);
    expect(screen.getByText('Ticket content')).toBeInTheDocument();
  });

  it('has rotate-1 at rest', () => {
    const ticket = renderTicket(<Ticket>Content</Ticket>);
    expect(ticket).toHaveClass('rotate-1');
  });

  it('has paper-white background and hairline border', () => {
    const ticket = renderTicket(<Ticket>Content</Ticket>);
    expect(ticket).toHaveClass('bg-paper-white');
    expect(ticket).toHaveClass('border-line');
  });

  it('applies custom className', () => {
    const ticket = renderTicket(<Ticket className="my-ticket">Content</Ticket>);
    expect(ticket).toHaveClass('my-ticket');
  });
});
