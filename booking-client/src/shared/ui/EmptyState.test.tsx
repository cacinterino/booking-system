import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState title="No bookings" description="You have no upcoming bookings." />
    );
    expect(screen.getByText('No bookings')).toBeInTheDocument();
    expect(screen.getByText('You have no upcoming bookings.')).toBeInTheDocument();
  });

  it('renders optional action', () => {
    render(
      <EmptyState
        title="Empty"
        action={<button>Add Item</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<EmptyState title="Empty" className="my-empty" />);
    const container = screen.getByText('Empty').parentElement!;
    expect(container).toHaveClass('my-empty');
  });
});
