import { useState } from 'react';
import type { AvailableSlot, BookingResponse } from '../types';
import { useCancelBooking, useRescheduleBooking } from '../hooks';
import { DateTimeStep } from './DateTimeStep';
import { StatusChip } from './StatusChip';
import { formatDateManila, formatPhp, formatTimeManila } from '../format';
import { usePublicBusiness } from '../hooks';
import { extractApiDetail } from '../errors';

interface BookingCardProps {
  booking: BookingResponse;
  accessCode: string;
  showActions: boolean;
}

const ACTIONABLE_STATUSES = new Set([1, 2]);

export function BookingCard({ booking, accessCode, showActions }: BookingCardProps) {
  const [panel, setPanel] = useState<'reschedule' | 'cancel' | null>(null);
  const [slot, setSlot] = useState<AvailableSlot | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const businessQuery = usePublicBusiness(booking.businessSlug, panel === 'reschedule');
  const cancelMutation = useCancelBooking(accessCode);
  const rescheduleMutation = useRescheduleBooking(accessCode);

  const actionable = showActions && ACTIONABLE_STATUSES.has(booking.status);

  const handleCancel = async () => {
    setError(null);
    try {
      await cancelMutation.mutateAsync({ id: booking.id, reason });
      setPanel(null);
      setReason('');
    } catch (err) {
      setError(extractApiDetail(err) ?? 'Could not cancel the booking. Please try again.');
    }
  };

  const handleReschedule = async () => {
    if (!slot) return;
    setError(null);
    try {
      await rescheduleMutation.mutateAsync({ id: booking.id, startTime: slot.startUtc });
      setPanel(null);
      setSlot(null);
    } catch (err) {
      setError(extractApiDetail(err) ?? 'Could not reschedule. Please try again.');
    }
  };

  const busy = cancelMutation.isPending || rescheduleMutation.isPending;

  return (
    <article className="ticket-plain">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-widest text-brass">{booking.businessName}</p>
          <h3 className="mt-1 font-display text-xl font-semibold text-ink">{booking.serviceName}</h3>
          <p className="mt-0.5 text-sm text-slate">with {booking.staffName}</p>
        </div>
        <StatusChip status={booking.status} />
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-4">
        <div>
          <p className="font-mono text-lg font-medium text-ink">{formatDateManila(booking.startTime)}</p>
          <p className="mt-0.5 font-mono text-sm text-ink-soft">{formatTimeManila(booking.startTime)}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs uppercase tracking-widest text-slate">Total</p>
          <p className="mt-1 font-mono font-medium text-ink">{formatPhp(booking.totalAmount)}</p>
        </div>
      </div>

      {actionable && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setPanel(panel === 'reschedule' ? null : 'reschedule');
              setError(null);
            }}
            className="btn-secondary px-4 py-2 text-sm"
          >
            {panel === 'reschedule' ? 'Close' : 'Reschedule'}
          </button>
          <button
            type="button"
            onClick={() => {
              setPanel(panel === 'cancel' ? null : 'cancel');
              setError(null);
            }}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            {panel === 'cancel' ? 'Keep booking' : 'Cancel booking'}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {panel === 'reschedule' && actionable && (
        <div className="mt-5 rounded-lg border border-line bg-paper p-4 sm:p-5">
          <p className="font-mono text-xs uppercase tracking-widest text-brass">Pick a new time</p>
          {businessQuery.data ? (
            <div className="mt-4">
              <DateTimeStep
                slug={booking.businessSlug}
                serviceId={booking.serviceId}
                serviceName={booking.serviceName}
                staffId={booking.staffId}
                advanceBookingDays={businessQuery.data.advanceBookingDays}
                selectedSlot={slot ?? undefined}
                onSelectSlot={(s) => setSlot(s)}
              />
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleReschedule}
                  disabled={!slot || busy}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {rescheduleMutation.isPending ? 'Rescheduling…' : 'Confirm new time'}
                </button>
                {slot && (
                  <p className="text-sm text-ink-soft">
                    {formatDateManila(slot.start)} · {formatTimeManila(slot.start)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate">Loading availability…</p>
          )}
        </div>
      )}

      {panel === 'cancel' && actionable && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50/50 p-4 sm:p-5">
          <p className="font-medium text-ink">Cancel this booking?</p>
          <p className="mt-1 text-sm text-ink-soft">
            The slot will be released and offered to other guests. This can't be undone.
          </p>
          <label className="label-field mt-4" htmlFor={`cancel-reason-${booking.id.slice(0, 8)}`}>
            Reason (optional)
          </label>
          <input
            id={`cancel-reason-${booking.id.slice(0, 8)}`}
            type="text"
            className="input-field"
            placeholder="e.g. Schedule conflict"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={busy}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={busy}
              className="btn-danger disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelMutation.isPending ? 'Cancelling…' : 'Cancel booking'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPanel(null);
                setError(null);
              }}
              className="btn-secondary"
            >
              Keep booking
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
