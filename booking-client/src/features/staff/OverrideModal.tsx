import { useState } from 'react';
import { useCreateOverride, useDeleteOverride, useStaffOverrides } from './adminHooks';
import type { StaffResponse } from './types';
import { extractApiDetail } from '../booking/errors';
import { formatDateManila } from '../booking/format';

interface OverrideModalProps {
  staff: StaffResponse;
  onClose: () => void;
}

export function OverrideModal({ staff, onClose }: OverrideModalProps) {
  const overridesQuery = useStaffOverrides(staff.id);
  const createMutation = useCreateOverride();
  const deleteMutation = useDeleteOverride();

  const [date, setDate] = useState(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }));
  const [isTimeOff, setIsTimeOff] = useState(false);
  const [start, setStart] = useState('10:00');
  const [end, setEnd] = useState('17:00');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const busy = createMutation.isPending || deleteMutation.isPending;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isTimeOff && start >= end) {
      setError('End time must be after the start time.');
      return;
    }
    try {
      await createMutation.mutateAsync({
        staffId: staff.id,
        payload: {
          date,
          isTimeOff,
          startTime: isTimeOff ? null : `${start}:00`,
          endTime: isTimeOff ? null : `${end}:00`,
          reason: reason.trim() || null,
        },
      });
      setReason('');
    } catch (err) {
      setError(extractApiDetail(err) ?? 'Could not add the override. Please try again.');
    }
  };

  const handleDelete = async (overrideId: string) => {
    setError(null);
    try {
      await deleteMutation.mutateAsync({ staffId: staff.id, overrideId });
    } catch (err) {
      setError(extractApiDetail(err) ?? 'Could not remove the override.');
    }
  };

  const overrides = overridesQuery.data ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" role="dialog" aria-modal="true" aria-label={`Day overrides for ${staff.fullName}`}>
      <div className="w-full max-w-lg card shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-brass">Day overrides</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">{staff.fullName}</h2>
          <p className="mt-1 text-sm text-slate">
            Override the weekly schedule for a specific day — close, or open on an off day.
          </p>
        </div>

        <form onSubmit={handleCreate} className="rounded-lg border border-line bg-paper p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field" htmlFor="ov-date">Date</label>
              <input id="ov-date" type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="label-field">Type</label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={isTimeOff}
                  onChange={(e) => setIsTimeOff(e.target.checked)}
                  className="h-4 w-4 rounded border-line text-brass focus:ring-brass"
                />
                Day off (unavailable)
              </label>
            </div>
          </div>

          {!isTimeOff && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="label-field" htmlFor="ov-start">Start</label>
                <input id="ov-start" type="time" className="input-field" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div>
                <label className="label-field" htmlFor="ov-end">End</label>
                <input id="ov-end" type="time" className="input-field" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>
          )}

          <div className="mt-4">
            <label className="label-field" htmlFor="ov-reason">Reason (optional)</label>
            <input id="ov-reason" type="text" className="input-field" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Holiday, staff training" />
          </div>

          {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">
              {createMutation.isPending ? 'Adding…' : 'Add override'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-slate">Current overrides</p>
          {overridesQuery.isLoading ? (
            <p className="text-sm text-slate">Loading…</p>
          ) : overrides.length === 0 ? (
            <p className="text-sm text-slate">No overrides yet.</p>
          ) : (
            <ul className="space-y-2">
              {overrides.map((override) => (
                <li key={override.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-paper px-3 py-2">
                  <div>
                    <p className="font-medium text-ink">{formatDateManila(`${override.date}T00:00:00`)}</p>
                    <p className="text-sm text-slate">
                      {override.isTimeOff
                        ? 'Day off'
                        : `${override.startTime?.slice(0, 5)} – ${override.endTime?.slice(0, 5)}`}
                      {override.reason ? ` · ${override.reason}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(override.id)}
                    disabled={busy}
                    className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 flex justify-end border-t border-line pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
