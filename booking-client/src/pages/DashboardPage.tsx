import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';
import { useCalendar, useMyWorkspace } from '../features/staff/hooks';
import { formatTimeManila } from '../features/booking/format';
import type { CalendarEvent } from '../features/staff/types';

function todayKey(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
}

function currentWeek(today: string): { from: string; to: string } {
  const [year, month, day] = today.split('-').map(Number);
  const base = new Date(Date.UTC(year, month - 1, day));
  const mondayOffset = (base.getUTCDay() + 6) % 7;
  const monday = new Date(base);
  monday.setUTCDate(base.getUTCDate() - mondayOffset);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return { from: monday.toISOString().slice(0, 10), to: sunday.toISOString().slice(0, 10) };
}

function Stat({ label, value, loading }: { label: string; value: number | string; loading: boolean }) {
  return (
    <div className="card">
      <h2 className="text-sm font-medium text-slate">{label}</h2>
      <p className="mt-3 text-3xl md:text-4xl font-bold text-ink font-display">
        {loading ? '—' : value}
      </p>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  const isAdmin = roles.includes('Admin');
  const isStaff = isAdmin || roles.includes('Staff');

  const workspaceQuery = useMyWorkspace(isStaff);
  const workspace = workspaceQuery.data;

  const today = todayKey();
  const { from, to } = useMemo(() => currentWeek(today), [today]);

  const calendarQuery = useCalendar(
    from,
    to,
    isAdmin ? undefined : workspace?.staff.id,
    isStaff && !!workspace,
  );
  const events = calendarQuery.data ?? [];

  const stats = useMemo(() => {
    const todays = events.filter((event: CalendarEvent) => event.start.slice(0, 10) === today);
    const pending = events.filter((event: CalendarEvent) => event.status === 1);
    return { todays: todays.length, week: events.length, pending: pending.length };
  }, [events, today]);

  const nextToday = [...events]
    .filter((event) => event.start.slice(0, 10) === today && event.status !== 3)
    .sort((a, b) => a.start.localeCompare(b.start))[0];

  const quickActions = isStaff
    ? [
        { label: 'Staff calendar', desc: 'Confirm and complete bookings', href: '/staff/calendar' },
        { label: 'Services', desc: 'Manage services and prices', href: '/admin/services' },
        { label: 'Staff', desc: 'Team, schedules, and services', href: '/admin/staff' },
        ...(workspace
          ? [{ label: 'Booking page', desc: `Open /book/${workspace.businessSlug}`, href: `/book/${workspace.businessSlug}` }]
          : []),
      ]
    : [{ label: 'My bookings', desc: 'View your upcoming appointments', href: '/my-bookings' }];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-brass-deep mb-2">Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-bold text-ink font-display">Welcome, {user?.fullName}</h1>
          <p className="text-slate mt-2">
            {isStaff
              ? 'Bookings from the staff calendar, for the current week.'
              : 'Your account overview.'}
          </p>
        </div>

        {isStaff && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Stat label="Today's bookings" value={stats.todays} loading={calendarQuery.isLoading} />
            <Stat label="This week" value={stats.week} loading={calendarQuery.isLoading} />
            <Stat label="Pending confirmation" value={stats.pending} loading={calendarQuery.isLoading} />
          </div>
        )}

        {isStaff && nextToday && (
          <div className="card mb-10">
            <p className="font-mono text-xs uppercase tracking-widest text-brass-deep mb-2">Next up today</p>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-mono text-lg font-medium text-ink">{formatTimeManila(nextToday.start)}</span>
              <span className="font-display font-semibold text-ink">{nextToday.customerName}</span>
              <span className="text-sm text-slate">{nextToday.title}</span>
            </div>
          </div>
        )}

        {isStaff && !workspaceQuery.isLoading && !workspace && (
          <div className="card mb-10">
            <h2 className="font-display text-lg font-semibold text-ink">No staff workspace yet</h2>
            <p className="mt-1 text-sm text-slate">
              This account is not linked to a staff record, so there is no calendar to show.
            </p>
          </div>
        )}

        <div className="card">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-widest text-brass-deep mb-2">Quick Actions</p>
            <h2 className="text-lg font-semibold text-ink font-display">Where to next</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                to={action.href}
                className="card hover:shadow-lg hover:border-brass transition-all"
              >
                <h3 className="text-lg font-semibold text-ink font-display">{action.label}</h3>
                <p className="text-slate text-sm mt-1">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
