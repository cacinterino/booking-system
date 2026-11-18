import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionHeader } from './SectionHeader';

describe('SectionHeader', () => {
  it('renders eyebrow and headline', () => {
    render(<SectionHeader eyebrow="Features" headline="Everything you need" />);
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Everything you need')).toBeInTheDocument();
  });

  it('eyebrow uses brass color and mono font', () => {
    render(<SectionHeader eyebrow="Features" headline="Headline" />);
    const eyebrow = screen.getByText('Features');
    expect(eyebrow).toHaveClass('text-brass-deep');
    expect(eyebrow).toHaveClass('font-mono');
    expect(eyebrow).toHaveClass('uppercase');
  });

  it('headline uses display font', () => {
    render(<SectionHeader eyebrow="Features" headline="Headline" />);
    const headline = screen.getByText('Headline');
    expect(headline).toHaveClass('font-display');
  });

  it('renders optional description', () => {
    render(<SectionHeader eyebrow="Features" headline="Headline" description="Some description" />);
    expect(screen.getByText('Some description')).toBeInTheDocument();
  });
});
