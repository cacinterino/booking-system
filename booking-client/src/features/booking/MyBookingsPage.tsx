import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { useMyBookings } from './hooks';
import { BookingCard } from './components/BookingCard';
import { toManilaDate } from './format';
import type { BookingResponse } from './types';

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
      <header className="border-b border-line bg-paper-white/90 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
          <Link to="/" className="font-display text-xl font-bold text-ink">
            Booked<span className="text-brass">.</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 sm:px-6 pb-20">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-brass">Your appointments</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">
            {isAuthenticatedCustomer ? `Welcome back, ${user?.fullName?.split(' ')[0] ?? ''}` : 'Manage your bookings'}
          </h1>
          <p className="mt-2 text-ink-soft">
            View what's coming up, move an appointment, or cancel one.
          </p>
        </div>

        {!enabled && (
          <div className="ticket-plain max-w-lg">
            <p className="font-mono text-xs uppercase tracking-widest text-brass">Access code</p>
            <p className="mt-1 text-sm text-ink-soft">
              The code from your confirmation lets you see and manage your bookings here.
            </p>
            <form className="mt-4 flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
              <input
                type="text"
                className="input-field sm:flex-1"
                placeholder="e.g. 8F3K-2Q7X"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                aria-label="Access code"
              />
              <button type="submit" className="btn-primary">
                View my bookings
              </button>
            </form>
            <label className="mt-3 flex items-center gap-2 text-sm text-slate">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-line text-brass focus:ring-brass"
              />
              Remember this device
            </label>
            {entryError && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {entryError}
              </p>
            )}
            <p className="mt-5 border-t border-line pt-4 text-sm text-slate">
              Didn't book yet?{' '}
              <Link to="/" className="font-medium text-brass hover:text-brass-soft">
                Find a business to book
              </Link>
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-4" aria-busy="true" aria-label="Loading your bookings">
            {[0, 1, 2].map((i) => (
              <div key={i} className="ticket-plain animate-pulse">
                <div className="h-4 w-40 rounded bg-ink/10" />
                <div className="mt-3 h-6 w-56 rounded bg-ink/10" />
                <div className="mt-4 flex justify-between border-t border-line pt-4">
                  <div className="h-5 w-32 rounded bg-ink/10" />
                  <div className="h-5 w-20 rounded bg-ink/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {loadError && (
          <div className="ticket-plain text-center">
            <p className="font-display text-lg font-semibold text-ink">We couldn't load your bookings</p>
            <p className="mt-2 text-sm text-ink-soft">
              The access code may be incorrect or expired. Check it and try again.
            </p>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(ACCESS_CODE_STORAGE_KEY);
                setAccessCode('');
              }}
              className="btn-secondary mt-6"
            >
              Enter a different code
            </button>
          </div>
        )}

        {enabled && !loading && !loadError && !hasBookings && (
          <div className="ticket-plain text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brass/30 bg-brass/10">
              <svg className="h-7 w-7 text-brass" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold text-ink">Nothing on the books yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
              Bookings tied to this access code will appear here, ready to view or reschedule.
            </p>
          </div>
        )}

        {enabled && !loading && !loadError && upcoming.length > 0 && (
          <section className="mt-2" aria-label="Upcoming bookings">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-slate">Upcoming</p>
            <div className="space-y-4">
              {upcoming.map((booking) => (
                <BookingCard key={booking.id} booking={booking} accessCode={useCode.trim()} showActions />
              ))}
            </div>
          </section>
        )}

        {enabled && !loading && !loadError && past.length > 0 && (
          <section className="mt-10" aria-label="Past bookings">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-slate">Past</p>
            <div className="space-y-4">
              {past.map((booking) => (
                <BookingCard key={booking.id} booking={booking} accessCode={useCode.trim()} showActions={false} />
              ))}
            </div>
          </section>
        )}

        {enabled && !loading && !loadError && (
          <div className="mt-10 border-t border-line pt-6">
            <button
              type="button"
              onClick={handleClear}
              className="font-mono text-xs uppercase tracking-widest text-slate hover:text-ink transition-colors"
            >
              Use a different access code
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
