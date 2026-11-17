import { useMemo, useState } from 'react';
import { useCalendar, useMyWorkspace, useSetBookingStatus } from './hooks';
import { BookingStatusLabel } from './types';
import type { CalendarEvent } from './types';
import { toManilaDate, formatTimeManila } from '../booking/format';
import { extractApiDetail } from '../booking/errors';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_STYLES: Record<number, string> = {
  1: 'bg-brass/10 text-brass border-brass/30',
  2: 'bg-sage/10 text-sage border-sage/30',
  3: 'bg-ink/5 text-slate border-line',
  4: 'bg-ink/5 text-ink-soft border-line',
  5: 'bg-red-50 text-red-600 border-red-200',
};

function toDateKey(localIso: string): string {
  return toManilaDate(localIso).toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
}

function todayKey(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
}

function weekDays(anchor: Date): Date[] {
  const monday = new Date(anchor);
  const dow = (anchor.getDay() + 6) % 7;
  monday.setDate(anchor.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function dayKey(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
}

export function StaffDashboardPage() {
  const workspaceQuery = useMyWorkspace();
  const [anchor, setAnchor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => todayKey());
  const [actionError, setActionError] = useState<string | null>(null);

  const isAdmin = useMemo(() => {
    const roles = localStorage.getItem('roles');
    return roles ? roles.includes('Admin') : false;
  }, []);

  const workspace = workspaceQuery.data;
  const staffId = workspace?.staff.id;

  const days = useMemo(() => weekDays(anchor), [anchor]);
  const from = dayKey(days[0]);
  const to = dayKey(days[6]);

  const calendarQuery = useCalendar(from, to, isAdmin ? undefined : staffId, !!workspace);
  const statusMutation = useSetBookingStatus();

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of calendarQuery.data ?? []) {
      const key = toDateKey(event.start);
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.start.localeCompare(b.start));
    return map;
  }, [calendarQuery.data]);

  const selectedEvents = eventsByDay.get(selectedDate) ?? [];

  const handleStatus = async (event: CalendarEvent, status: number) => {
    setActionError(null);
    try {
      await statusMutation.mutateAsync({ id: event.id, status });
    } catch (err) {
      setActionError(extractApiDetail(err) ?? 'Could not update the booking. Please try again.');
    }
  };

  const prevWeek = () => setAnchor((a) => new Date(a.getTime() - 7 * 86400000));
  const nextWeek = () => setAnchor((a) => new Date(a.getTime() + 7 * 86400000));

  if (workspaceQuery.isLoading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 w-48 rounded bg-ink/10" />
              <div className="mt-3 h-6 w-72 rounded bg-ink/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (workspaceQuery.isError || !workspace) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="card max-w-lg">
          <h1 className="font-display text-2xl font-semibold text-ink">No workspace found</h1>
          <p className="mt-2 text-ink-soft">
            You need to be invited as staff to a business before you can see a calendar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-brass-deep">{workspace.businessName}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Today's calendar</h1>
            <p className="mt-1 text-sm text-slate">
              {workspace.staff.fullName} · {new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={prevWeek} className="btn-secondary px-4 py-2 text-sm">
              Previous week
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setAnchor(now);
                setSelectedDate(todayKey());
              }}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Today
            </button>
            <button type="button" onClick={nextWeek} className="btn-secondary px-4 py-2 text-sm">
              Next week
            </button>
          </div>
        </div>

        {actionError && (
          <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {actionError}
          </div>
        )}

        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="grid grid-cols-7 gap-2 min-w-[560px]" role="group" aria-label="Week days">
            {days.map((day) => {
              const key = dayKey(day);
              const count = eventsByDay.get(key)?.length ?? 0;
              const isToday = key === todayKey();
              const isSelected = key === selectedDate;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                  className={`rounded-lg border p-3 text-center transition-colors ${
                    isSelected
                      ? 'border-brass bg-brass text-paper-white'
                      : isToday
                        ? 'border-brass/50 bg-brass/10 text-ink hover:bg-brass/20'
                        : 'border-line bg-paper-white text-ink hover:bg-ink/5'
                  }`}
                >
                  <span className={`block font-mono text-xs uppercase tracking-wider ${isSelected ? 'text-paper-white' : 'text-slate'}`}>
                    {WEEKDAY_LABELS[day.getDay()]}
                  </span>
                  <span className="mt-1 block font-display text-xl font-semibold">{day.getDate()}</span>
                  <span className={`mt-1 block font-mono text-xs ${isSelected ? 'text-paper-white/90' : 'text-slate'}`}>
                    {count} booking{count === 1 ? '' : 's'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-slate">
            {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-PH', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          {calendarQuery.isLoading && (
            <div className="space-y-3" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-5 w-64 rounded bg-ink/10" />
                </div>
              ))}
            </div>
          )}

          {!calendarQuery.isLoading && selectedEvents.length === 0 && (
            <div className="card text-center">
              <p className="font-display text-lg font-semibold text-ink">No bookings this day</p>
              <p className="mt-1 text-sm text-slate">The ledger is clear — enjoy the quiet.</p>
            </div>
          )}

          {selectedEvents.length > 0 && (
            <div className="space-y-3">
              {selectedEvents.map((event) => (
                <article key={event.id} className="card">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <span className="w-24 shrink-0 font-mono text-lg font-medium text-ink">
                        {formatTimeManila(event.start)}
                      </span>
                      <div>
                        <p className="font-display font-semibold text-ink">{event.customerName}</p>
                        <p className="text-sm text-slate">{event.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider ${STATUS_STYLES[event.status] ?? STATUS_STYLES[1]}`}>
                        {BookingStatusLabel[event.status] ?? 'Booking'}
                      </span>
                      {event.status === 1 && (
                        <button
                          type="button"
                          onClick={() => handleStatus(event, 2)}
                          disabled={statusMutation.isPending}
                          className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
                        >
                          Confirm
                        </button>
                      )}
                      {event.status === 2 && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleStatus(event, 4)}
                            disabled={statusMutation.isPending}
                            className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
                          >
                            Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatus(event, 5)}
                            disabled={statusMutation.isPending}
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                          >
                            No-show
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
