import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';
import { useMyWorkspace, useTodaysBookings } from '../features/staff/hooks';
import { useServices } from '../features/services/hooks';
import { useStaffList } from '../features/staff/adminHooks';
import { Card, Badge, Button, SectionHeader, EmptyState, LoadingSkeleton } from '../shared/ui';
import { formatTimeManila, formatPhp } from '../features/booking/format';
import { BookingStatusLabel } from '../features/staff/types';

export function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.roles.includes('Admin') ?? false;

  const workspaceQuery = useMyWorkspace();
  const workspace = workspaceQuery.data;
  const businessSlug = workspace?.businessSlug;
  const businessName = workspace?.businessName;

  const todaysQuery = useTodaysBookings(undefined, !!workspace);
  const servicesQuery = useServices(false);
  const staffQuery = useStaffList(false);

  const [copied, setCopied] = useState(false);

  const bookings = todaysQuery.data?.items ?? [];
  const totalToday = todaysQuery.data?.total ?? bookings.length;
  const totalServices = servicesQuery.data?.length ?? 0;
  const totalStaff = staffQuery.data?.length ?? 0;

  const handleCopyLink = () => {
    if (!businessSlug) return;
    const url = `${window.location.origin}/book/${businessSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusVariant = (status: number): 'brass' | 'sage' | 'slate' | 'red' => {
    switch (status) {
      case 1:
        return 'brass'; // Pending
      case 2:
        return 'sage'; // Confirmed
      case 4:
        return 'slate'; // Completed
      case 3:
      case 5:
        return 'red'; // Cancelled / No-show
      default:
        return 'slate';
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-line">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-brass-deep mb-2">
              Business Ledger &bull; Manila (UTC+8)
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink tracking-tight">
              Welcome back, {user?.fullName?.split(' ')[0] ?? 'Partner'}
            </h1>
            <p className="text-slate text-sm sm:text-base mt-2">
              {businessName
                ? `Managing ${businessName} â€” daily overview of bookings, staff, and appointments.`
                : "Here's what's happening today in your appointment ledger."}
            </p>
          </div>

          {businessSlug && (
            <div className="flex items-center gap-3 bg-paper-white border border-line p-2.5 rounded-lg shadow-xs">
              <div className="text-left text-xs">
                <span className="text-slate block font-mono">Public Booking Page</span>
                <span className="font-mono text-ink font-medium">/book/{businessSlug}</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? 'Copied âœ“' : 'Copy link'}
              </Button>
              <Link to={`/book/${businessSlug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="sm">
                  Visit
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-slate">
                Today's Bookings
              </span>
              <div className="p-2 bg-brass/10 rounded-md text-brass">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            {todaysQuery.isLoading ? (
              <LoadingSkeleton className="h-9 w-20" />
            ) : (
              <div>
                <p className="font-display text-4xl font-bold text-ink">{totalToday}</p>
                <p className="text-xs text-slate mt-1 font-mono">Scheduled for today</p>
              </div>
            )}
          </Card>

          <Card className="flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-slate">
                Active Services
              </span>
              <div className="p-2 bg-brass/10 rounded-md text-brass">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            {servicesQuery.isLoading ? (
              <LoadingSkeleton className="h-9 w-20" />
            ) : (
              <div>
                <p className="font-display text-4xl font-bold text-ink">{totalServices}</p>
                <p className="text-xs text-slate mt-1 font-mono">Available for online booking</p>
              </div>
            )}
          </Card>

          <Card className="flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs uppercase tracking-wider text-slate">
                Team On Duty
              </span>
              <div className="p-2 bg-brass/10 rounded-md text-brass">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            {staffQuery.isLoading ? (
              <LoadingSkeleton className="h-9 w-20" />
            ) : (
              <div>
                <p className="font-display text-4xl font-bold text-ink">{totalStaff}</p>
                <p className="text-xs text-slate mt-1 font-mono">Active service providers</p>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <SectionHeader
            eyebrow="Quick Actions"
            headline="Manage your practice"
            description="Frequently used shortcuts to manage daily operations and customer requests."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/staff/calendar" className="group">
              <Card className="h-full hover:border-brass transition-colors">
                <div className="p-3 bg-brass/10 text-brass rounded-lg w-fit mb-3 group-hover:bg-brass group-hover:text-paper-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-semibold text-ink group-hover:text-brass-deep transition-colors">
                  Staff Calendar
                </h3>
                <p className="text-slate text-xs mt-1 leading-relaxed">
                  View daily schedule, confirm walk-ins, and update booking statuses.
                </p>
              </Card>
            </Link>

            <Link to="/admin/services" className="group">
              <Card className="h-full hover:border-brass transition-colors">
                <div className="p-3 bg-brass/10 text-brass rounded-lg w-fit mb-3 group-hover:bg-brass group-hover:text-paper-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-semibold text-ink group-hover:text-brass-deep transition-colors">
                  Services Menu
                </h3>
                <p className="text-slate text-xs mt-1 leading-relaxed">
                  Configure durations, prices, and categorized service offerings.
                </p>
              </Card>
            </Link>

            {isAdmin && (
              <Link to="/admin/staff" className="group">
                <Card className="h-full hover:border-brass transition-colors">
                  <div className="p-3 bg-brass/10 text-brass rounded-lg w-fit mb-3 group-hover:bg-brass group-hover:text-paper-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-ink group-hover:text-brass-deep transition-colors">
                    Team &amp; Schedules
                  </h3>
                  <p className="text-slate text-xs mt-1 leading-relaxed">
                    Set weekly shift hours, staff assignments, and vacation overrides.
                  </p>
                </Card>
              </Link>
            )}

            <Link to={businessSlug ? `/book/${businessSlug}` : '#'} className="group">
              <Card className="h-full hover:border-brass transition-colors">
                <div className="p-3 bg-brass/10 text-brass rounded-lg w-fit mb-3 group-hover:bg-brass group-hover:text-paper-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-semibold text-ink group-hover:text-brass-deep transition-colors">
                  Booking Wizard
                </h3>
                <p className="text-slate text-xs mt-1 leading-relaxed">
                  Test your public guest booking experience and preview available slots.
                </p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Today's Schedule Overview */}
        <div>
          <SectionHeader
            eyebrow="Daily Ledger"
            headline="Today's Appointments"
            description="Live roster of guest appointments scheduled for today in Philippine Standard Time."
          >
            <Link to="/staff/calendar">
              <Button variant="secondary" size="sm">
                Open full calendar &rarr;
              </Button>
            </Link>
          </SectionHeader>

          {todaysQuery.isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <LoadingSkeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <EmptyState
                title="No appointments on the ledger today"
                description="Share your public booking link with clients or use the calendar to register direct bookings."
                icon={
                  <svg className="w-7 h-7 text-brass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                action={
                  <div className="flex gap-3">
                    {businessSlug && (
                      <Button variant="primary" size="sm" onClick={handleCopyLink}>
                        {copied ? 'Link Copied!' : 'Copy booking link'}
                      </Button>
                    )}
                    <Link to="/staff/calendar">
                      <Button variant="secondary" size="sm">
                        Go to Calendar
                      </Button>
                    </Link>
                  </div>
                }
              />
            </Card>
          ) : (
            <div className="bg-paper-white border border-line rounded-lg overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-paper/60 text-slate font-mono text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Staff</th>
                      <th className="py-3 px-4">Fee</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-sm">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-paper/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-ink whitespace-nowrap">
                          {formatTimeManila(booking.startTime)}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-ink">
                          {booking.customerName}
                        </td>
                        <td className="py-3.5 px-4 text-slate">
                          {booking.serviceName}
                        </td>
                        <td className="py-3.5 px-4 text-slate">
                          {booking.staffName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-ink">
                          {formatPhp(booking.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={getStatusVariant(booking.status)}>
                            {BookingStatusLabel[booking.status] ?? 'Unknown'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
