import { useState } from 'react';
import type { BookingResponse } from '../types';

interface ConfirmationStepProps {
  booking: BookingResponse;
}

function formatDateTime(localIso: string): string {
  const date = new Date(localIso);
  return date.toLocaleString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function ConfirmationStep({ booking }: ConfirmationStepProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    if (!booking.accessCode) return;
    try {
      await navigator.clipboard.writeText(booking.accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="ticket text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-deep">You're booked</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-ink">See you there</h2>
        <p className="mt-3 text-ink-soft">{booking.serviceName}</p>
        <p className="mt-1 text-ink-soft">with {booking.staffName}</p>
        <p className="mt-3 font-display text-xl font-semibold text-ink">{formatDateTime(booking.startTime)}</p>
      </div>

      <div className="ticket-plain space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-slate">Booking reference</p>
            <p className="mt-1 font-mono font-medium text-ink">{booking.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs uppercase tracking-widest text-slate">Total</p>
            <p className="mt-1 font-mono font-medium text-ink">
              {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(
                booking.totalAmount,
              )}
            </p>
          </div>
        </div>

        {booking.accessCode && (
          <div className="p-4 rounded-lg border border-brass/30 bg-brass/10">
            <p className="font-mono text-xs uppercase tracking-widest text-brass-deep">Your access code</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="font-mono text-lg font-bold tracking-widest text-ink">{booking.accessCode}</p>
              <button type="button" onClick={copyCode} className="btn-secondary px-4 py-2 text-sm">
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              Use this code to view or change your booking later — keep it safe.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
