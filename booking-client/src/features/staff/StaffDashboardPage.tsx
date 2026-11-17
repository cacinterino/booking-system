import { useMemo, useState } from 'react';
import { useCalendar, useMyWorkspace, useSetBookingStatus } from './hooks';
import { BookingStatusLabel } from './types';
import type { CalendarEvent } from './types';
import { toManilaDate, formatTimeManila } from '../booking/format';
import { extractApiDetail } from '../booking/errors';
import { Card, Badge, Button, SectionHeader, EmptyState, LoadingSkeleton } from '../../shared/ui';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  const getStatusVariant = (status: number): 'brass' | 'sage' | 'slate' | 'red' => {
    switch (status) {
      case 1:
        return 'brass';
      case 2:
        return 'sage';
      case 4:
        return 'slate';
      case 3:
      case 5:
        return 'red';
      default:
        return 'slate';
    }
  };

  const prevWeek = () => setAnchor((a) => new Date(a.getTime() - 7 * 86400000));
  const nextWeek = () => setAnchor((a) => new Date(a.getTime() + 7 * 86400000));

  if (workspaceQuery.isLoading) {
    return (
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4" aria-busy="true">
          <LoadingSkeleton className="h-10 w-64" />
          <LoadingSkeleton className="h-6 w-96" />
          <div className="grid grid-cols-7 gap-2 mt-6">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <LoadingSkeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (workspaceQuery.isError || !workspace) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <Card>
            <EmptyState
              title="No staff workspace found"
              description="You must be registered as a staff member or business administrator to view this calendar."
              icon={
                <svg className="w-8 h-8 text-brass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with week navigation */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-line">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-brass-deep mb-1.5">
              {workspace.businessName} &bull; Staff Ledger
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
              Team Calendar
            </h1>
            <p className="mt-1 text-sm text-slate">
              Active staff: <span className="font-medium text-ink">{workspace.staff.fullName}</span> &bull; Asia/Manila (UTC+8)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={prevWeek}
              aria-label="Previous week"
            >
              &larr; Prev Week
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setAnchor(new Date());
                setSelectedDate(todayKey());
              }}
            >
              Today
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={nextWeek}
              aria-label="Next week"
            >
              Next Week &rarr;
            </Button>
          </div>
        </div>

        {actionError && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{actionError}</span>
            <button
              onClick={() => setActionError(null)}
              className="text-red-500 hover:text-red-800 text-xs font-mono ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 7-Day Week Selector Bar */}
        <div className="bg-paper-white border border-line rounded-lg p-3 shadow-xs">
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const key = dayKey(day);
              const isSelected = key === selectedDate;
              const isToday = key === todayKey();
              const count = eventsByDay.get(key)?.length ?? 0;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                  className={`rounded-lg border p-3 text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-brass bg-brass text-paper-white shadow-xs'
                      : isToday
                        ? 'border-brass/40 bg-brass/10 text-ink hover:bg-brass/20'
                        : 'border-line/70 bg-paper-white text-ink hover:bg-ink/5'
                  }`}
                >
                  <span
                    className={`block font-mono text-xs uppercase tracking-wider ${
                      isSelected ? 'text-paper-white' : 'text-slate'
                    }`}
                  >
                    {WEEKDAY_LABELS[day.getDay()]}
                  </span>
                  <span className="mt-1 block font-display text-xl sm:text-2xl font-bold">
                    {day.getDate()}
                  </span>
                  <span
                    className={`mt-1 block font-mono text-[11px] ${
                      isSelected ? 'text-paper-white/90' : 'text-slate'
                    }`}
                  >
                    {count} {count === 1 ? 'booking' : 'bookings'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Timeline */}
        <div className="space-y-4">
          <SectionHeader
            eyebrow="Daily Schedule"
            headline={new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-PH', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
            description={`${selectedEvents.length} appointment${selectedEvents.length === 1 ? '' : 's'} on the ledger for this date.`}
          />

          {calendarQuery.isLoading && (
            <div className="space-y-3" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <LoadingSkeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          )}

          {!calendarQuery.isLoading && selectedEvents.length === 0 && (
            <Card>
              <EmptyState
                title="The ledger is clear for this day"
                description="No client appointments booked for this date. Time to prep or take walk-ins."
                icon={
                  <svg className="w-7 h-7 text-brass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </Card>
          )}

          {selectedEvents.length > 0 && (
            <div className="space-y-3">
              {selectedEvents.map((event) => (
                <Card key={event.id} className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-24 shrink-0 font-mono text-base sm:text-lg font-bold text-ink">
                        {formatTimeManila(event.start)}
                      </div>
                      <div className="border-l border-line pl-4">
                        <p className="font-display text-lg font-semibold text-ink">
                          {event.customerName}
                        </p>
                        <p className="text-sm text-slate mt-0.5">
                          {event.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-line">
                      <Badge variant={getStatusVariant(event.status)}>
                        {BookingStatusLabel[event.status] ?? 'Booking'}
                      </Badge>

                      {event.status === 1 && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStatus(event, 2)}
                          disabled={statusMutation.isPending}
                        >
                          Confirm
                        </Button>
                      )}

                      {event.status === 2 && (
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStatus(event, 4)}
                            disabled={statusMutation.isPending}
                          >
                            Complete
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleStatus(event, 5)}
                            disabled={statusMutation.isPending}
                          >
                            No-show
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
