import { describe, it, expect } from 'vitest';
import { formatDateTimeManila, formatTimeManila, toManilaDate } from './format';

describe('booking date formatting', () => {
  it('parses an API UTC instant without appending a second offset', () => {
    // Regression: appending 'Z' to a string that already ends in 'Z' produced Invalid Date.
    const date = toManilaDate('2026-11-25T01:00:00Z');

    expect(Number.isNaN(date.getTime())).toBe(false);
    expect(date.toISOString()).toBe('2026-11-25T01:00:00.000Z');
  });

  it('renders a UTC instant as Manila wall-clock time (UTC+8)', () => {
    const label = formatDateTimeManila('2026-11-25T01:00:00Z');

    expect(label).not.toContain('Invalid Date');
    expect(label).toMatch(/Nov 25/);
    expect(label).toMatch(/9:00/);
  });

  it('renders a Manila wall-clock string as the same wall-clock time', () => {
    const label = formatTimeManila('2026-11-25T09:00:00');

    expect(label).not.toContain('Invalid Date');
    expect(label).toMatch(/9:00/);
  });

  it('keeps an explicit +08:00 offset as-is', () => {
    expect(toManilaDate('2026-11-25T09:00:00+08:00').toISOString()).toBe(
      '2026-11-25T01:00:00.000Z',
    );
  });
});
