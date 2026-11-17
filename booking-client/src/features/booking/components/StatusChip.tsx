import type { BookingResponse } from '../types';
import { BookingStatusLabel } from '../types';

const STATUS_STYLES: Record<number, string> = {
  1: 'bg-brass/10 text-brass-deep border-brass/30',
  2: 'bg-sage/10 text-sage border-sage/30',
  3: 'bg-ink/5 text-slate border-line',
  4: 'bg-ink/5 text-ink-soft border-line',
  5: 'bg-red-50 text-red-600 border-red-200',
};

export function StatusChip({ status }: { status: number }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider ${STATUS_STYLES[status] ?? STATUS_STYLES[1]}`}
    >
      {BookingStatusLabel[status] ?? 'Booking'}
    </span>
  );
}

export function BookingReference({ booking }: { booking: BookingResponse }) {
  return <span className="font-mono text-xs text-slate">{booking.id.slice(0, 8).toUpperCase()}</span>;
}
