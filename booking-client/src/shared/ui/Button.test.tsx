import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders primary variant with brass background', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button', { name: 'Primary' });
    expect(button).toHaveClass('bg-brass');
    expect(button).toHaveClass('text-paper-white');
  });

  it('renders secondary variant with paper-white background', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button', { name: 'Secondary' });
    expect(button).toHaveClass('bg-paper-white');
    expect(button).toHaveClass('text-ink');
  });

  it('renders danger variant with red background', () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole('button', { name: 'Danger' });
    expect(button).toHaveClass('bg-red-600');
    expect(button).toHaveClass('text-white');
  });

  it('renders on-dark variant', () => {
    render(<Button variant="on-dark">On Dark</Button>);
    const button = screen.getByRole('button', { name: 'On Dark' });
    expect(button).toHaveClass('bg-brass');
    expect(button).toHaveClass('text-ink');
  });

  it('renders outline-on-dark variant', () => {
    render(<Button variant="outline-on-dark">Outline</Button>);
    const button = screen.getByRole('button', { name: 'Outline' });
    expect(button).toHaveClass('border-paper-white/30');
    expect(button).toHaveClass('text-paper-white');
  });

  it('applies custom className', () => {
    render(<Button className="my-custom-class">Custom</Button>);
    const button = screen.getByRole('button', { name: 'Custom' });
    expect(button).toHaveClass('my-custom-class');
  });

  it('renders as anchor when href is set', () => {
    render(
      <Button href="/test">
        Link
      </Button>
    );
    const link = screen.getByRole('link', { name: 'Link' });
    expect(link).toHaveAttribute('href', '/test');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
  });
});
