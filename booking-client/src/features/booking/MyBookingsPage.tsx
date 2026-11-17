import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { useMyBookings } from './hooks';
import { BookingCard } from './components/BookingCard';
import { toManilaDate } from './format';
import type { BookingResponse } from './types';
import { Card, Badge, Button, EmptyState, LoadingSkeleton } from '../../shared/ui';

const ACCESS_CODE_STORAGE_KEY = 'booked.accessCode';

function isUpcoming(booking: BookingResponse): boolean {
  return toManilaDate(booking.startTime).getTime() > Date.now();
}

export function MyBookingsPage() {
  const { user } = useAuth();
  const isAuthenticatedCustomer = !!user && !user.roles.includes('Staff') && !user.roles.includes('Admin');

  const [codeInput, setCodeInput] = useState('');
  const [accessCode, setAccessCode] = useState(() => {
    const stored = localStorage.getItem(ACCESS_CODE_STORAGE_KEY);
    return stored ?? '';
  });
  const [remember, setRemember] = useState(true);
  const [entryError, setEntryError] = useState<string | null>(null);

  const useCode = isAuthenticatedCustomer ? ' ' : accessCode;
  const enabled = isAuthenticatedCustomer || accessCode.length > 0;

  const upcomingQuery = useMyBookings(useCode.trim(), true, enabled);
  const pastQuery = useMyBookings(useCode.trim(), false, enabled);

  const upcoming = (upcomingQuery.data ?? []).filter(isUpcoming);
  const past = (pastQuery.data ?? []).filter((b) => !isUpcoming(b) || b.status === 4 || b.status === 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    if (remember) {
      localStorage.setItem(ACCESS_CODE_STORAGE_KEY, code);
    } else {
      localStorage.removeItem(ACCESS_CODE_STORAGE_KEY);
    }
    setAccessCode(code);
    setEntryError(null);
  };

  const handleClear = () => {
    localStorage.removeItem(ACCESS_CODE_STORAGE_KEY);
    setAccessCode('');
    setCodeInput('');
  };

  const loading = enabled && (upcomingQuery.isLoading || pastQuery.isLoading);
  const loadError = enabled && (upcomingQuery.isError || pastQuery.isError);
  const hasBookings = upcoming.length > 0 || past.length > 0;

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper-white/90 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold text-ink">
            Booked<span className="text-brass">.</span>
          </Link>
          {enabled && !isAuthenticatedCustomer && (
            <button
              type="button"
              onClick={handleClear}
              className="font-mono text-xs uppercase tracking-wider text-slate hover:text-ink transition-colors cursor-pointer"
            >
              Change code &rarr;
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 sm:px-6 pb-20 space-y-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-brass-deep mb-1.5">
            Appointments &amp; History
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
            {isAuthenticatedCustomer
              ? `Welcome back, ${user?.fullName?.split(' ')[0] ?? ''}`
              : 'Client Appointment Ledger'}
          </h1>
          <p className="text-slate text-sm sm:text-base mt-2">
            View upcoming bookings, reschedule to a different time slot, or cancel existing appointments.
          </p>
        </div>

        {!enabled && (
          <Card className="max-w-xl">
            <p className="font-mono text-xs uppercase tracking-widest text-brass-deep mb-1">
              Guest Access Code
            </p>
            <h2 className="font-display text-xl font-bold text-ink mb-2">
              Lookup Your Appointments
            </h2>
            <p className="text-sm text-slate mb-4">
              Enter the 8-character confirmation access code you received when booking your appointment.
            </p>
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-line rounded-lg bg-paper-white text-ink font-mono uppercase tracking-widest placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-brass sm:flex-1"
                placeholder="e.g. 8F3K-2Q7X"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                aria-label="Access code"
              />
              <Button type="submit" variant="primary" size="md">
                View my bookings
              </Button>
            </form>
            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-line text-brass focus:ring-brass"
                />
                Remember code on this device
              </label>
            </div>
            {entryError && (
              <p role="alert" className="mt-3 text-xs font-mono text-red-600">
                {entryError}
              </p>
            )}
            <p className="mt-6 border-t border-line pt-4 text-xs text-slate font-mono">
              Haven't booked yet?{' '}
              <Link to="/" className="font-semibold text-brass-deep hover:text-brass">
                Explore services and businesses &rarr;
              </Link>
            </p>
          </Card>
        )}

        {loading && (
          <div className="space-y-4" aria-busy="true" aria-label="Loading your bookings">
            {[0, 1, 2].map((i) => (
              <LoadingSkeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        )}

        {loadError && (
          <Card>
            <EmptyState
              title="Could not retrieve your bookings"
              description="The access code entered may be incorrect or no longer active. Please double check the code provided in your booking receipt."
              icon={
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem(ACCESS_CODE_STORAGE_KEY);
                    setAccessCode('');
                  }}
                >
                  Enter different code
                </Button>
              }
            />
          </Card>
        )}

        {enabled && !loading && !loadError && !hasBookings && (
          <Card>
            <EmptyState
              title="Nothing on the books yet"
              description="No active or past bookings were found for this access code."
              icon={
                <svg className="w-8 h-8 text-brass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              action={
                <Link to="/">
                  <Button variant="primary" size="sm">
                    Book an appointment
                  </Button>
                </Link>
              }
            />
          </Card>
        )}

        {enabled && !loading && !loadError && upcoming.length > 0 && (
          <section aria-label="Upcoming bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-widest text-slate">
                Upcoming Appointments
              </p>
              <Badge variant="sage">
                {upcoming.length} {upcoming.length === 1 ? 'upcoming' : 'upcoming'}
              </Badge>
            </div>
            <div className="space-y-4">
              {upcoming.map((booking) => (
                <BookingCard key={booking.id} booking={booking} accessCode={useCode.trim()} showActions />
              ))}
            </div>
          </section>
        )}

        {enabled && !loading && !loadError && past.length > 0 && (
          <section aria-label="Past bookings" className="space-y-4 pt-4 border-t border-line">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-widest text-slate">
                Past History
              </p>
              <Badge variant="slate">
                {past.length} completed
              </Badge>
            </div>
            <div className="space-y-4 opacity-90">
              {past.map((booking) => (
                <BookingCard key={booking.id} booking={booking} accessCode={useCode.trim()} showActions={false} />
              ))}
            </div>
          </section>
        )}

        {enabled && !loading && !loadError && !isAuthenticatedCustomer && (
          <div className="pt-6 border-t border-line flex justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClear}
            >
              Lookup with a different code
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
