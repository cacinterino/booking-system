import { useEffect, useState } from 'react';
import { useSetSchedule, useStaffSchedule } from './adminHooks';
import type { ScheduleEntryRequest, StaffResponse } from './types';
import { extractApiDetail } from '../booking/errors';

const WEEKDAYS: { key: number; label: string }[] = [
  { key: 0, label: 'Sun' },
  { key: 1, label: 'Mon' },
  { key: 2, label: 'Tue' },
  { key: 3, label: 'Wed' },
  { key: 4, label: 'Thu' },
  { key: 5, label: 'Fri' },
  { key: 6, label: 'Sat' },
];

interface ScheduleModalProps {
  staff: StaffResponse;
  services: unknown[];
  onClose: () => void;
}

function toTimeInput(ts: string | null | undefined): string {
  if (!ts) return '09:00';
  return ts.slice(0, 5);
}

function toTimeSpan(time: string): string {
  return `${time}:00`;
}

export function ScheduleModal({ staff, services: _services, onClose }: ScheduleModalProps) {
  const scheduleQuery = useStaffSchedule(staff.id);
  const setScheduleMutation = useSetSchedule();
  const busy = setScheduleMutation.isPending;

  const [draft, setDraft] = useState<Record<number, { working: boolean; start: string; end: string }>>(
    () =>
      Object.fromEntries(
        WEEKDAYS.map(({ key }) => [key, { working: false, start: '09:00', end: '17:00' }]),
      ),
  );
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (scheduleQuery.data && !loaded) {
      const next: Record<number, { working: boolean; start: string; end: string }> = Object.fromEntries(
        WEEKDAYS.map(({ key }) => [key, { working: false, start: '09:00', end: '17:00' }]),
      );
      for (const entry of scheduleQuery.data.entries) {
        next[entry.dayOfWeek] = {
          working: entry.isWorking,
          start: toTimeInput(entry.startTime),
          end: toTimeInput(entry.endTime),
        };
      }
      setDraft(next);
      setLoaded(true);
    }
  }, [scheduleQuery.data, loaded]);

  const updateDay = (key: number, patch: Partial<{ working: boolean; start: string; end: string }>) => {
    setDraft((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const entries: ScheduleEntryRequest[] = [];
    for (const { key } of WEEKDAYS) {
      const day = draft[key];
      if (day.working) {
        if (day.start >= day.end) {
          setError(`${WEEKDAYS.find((d) => d.key === key)?.label} — end time must be after the start time.`);
          return;
        }
        entries.push({
          dayOfWeek: key,
          startTime: toTimeSpan(day.start),
          endTime: toTimeSpan(day.end),
          isWorking: true,
        });
      }
    }

    try {
      await setScheduleMutation.mutateAsync({ staffId: staff.id, entries });
      onClose();
    } catch (err) {
      setError(extractApiDetail(err) ?? 'Could not save the schedule. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" role="dialog" aria-modal="true" aria-label={`Weekly schedule for ${staff.fullName}`}>
      <form onSubmit={handleSave} className="w-full max-w-2xl card shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-brass-deep">Weekly schedule</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">{staff.fullName}</h2>
          <p className="mt-1 text-sm text-slate">
            This replaces the current week. Days with no working hours are treated as days off.
          </p>
        </div>

        {scheduleQuery.isLoading ? (
          <p className="text-slate">Loading current schedule…</p>
        ) : (
          <div className="space-y-3">
            {WEEKDAYS.map(({ key, label }) => {
              const day = draft[key];
              return (
                <div
                  key={key}
                  className={`flex flex-wrap items-center gap-3 rounded-lg border p-3 transition-colors ${
                    day.working ? 'border-brass/40 bg-brass/5' : 'border-line bg-paper'
                  }`}
                >
                  <label className="flex w-24 items-center gap-2 text-sm font-medium text-ink">
                    <input
                      type="checkbox"
                      checked={day.working}
                      onChange={(e) => updateDay(key, { working: e.target.checked })}
                      className="h-4 w-4 rounded border-line text-brass focus:ring-brass"
                    />
                    {label}
                  </label>
                  {day.working && (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="time"
                        value={day.start}
                        onChange={(e) => updateDay(key, { start: e.target.value })}
                        className="input-field w-36 px-3 py-2"
                        aria-label={`${label} start time`}
                      />
                      <span className="text-slate">to</span>
                      <input
                        type="time"
                        value={day.end}
                        onChange={(e) => updateDay(key, { end: e.target.value })}
                        className="input-field w-36 px-3 py-2"
                        aria-label={`${label} end time`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-2 border-t border-line pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={busy || scheduleQuery.isLoading} className="btn-primary disabled:opacity-50">
            {busy ? 'Saving…' : 'Save schedule'}
          </button>
        </div>
      </form>
    </div>
  );
}
