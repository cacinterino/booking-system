import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Public booking page',
    line: 'Customers pick a service, a staff member, a date, and an open slot — no account required.',
  },
  {
    title: 'Availability engine',
    line: 'Combines weekly staff hours, date overrides, service duration, and existing bookings into bookable slots.',
  },
  {
    title: 'Concurrency-safe bookings',
    line: 'A PostgreSQL exclusion constraint rejects overlapping rows, so the second request for a slot gets a clean 409.',
  },
  {
    title: 'Access-code lookup',
    line: 'Guests get a code that lets them find, reschedule, or cancel their appointment later.',
  },
];

const stack = [
  'ASP.NET Core 9 (Clean Architecture, MediatR, FluentValidation)',
  'EF Core 9 + PostgreSQL 16',
  'ASP.NET Core Identity + JWT',
  'React 19 + TypeScript + Vite + Tailwind CSS v4 + TanStack Query',
  'xUnit, Moq, FluentAssertions, Testcontainers, Respawn',
];

const flow = [
  { step: '1', call: 'GET /api/public/businesses/{slug}', tables: 'businesses' },
  { step: '2', call: 'GET /api/public/businesses/{slug}/services', tables: 'services' },
  { step: '3', call: 'GET /api/public/businesses/{slug}/staff?serviceId=…', tables: 'staff, staff_services' },
  {
    step: '4',
    call: 'GET /api/public/businesses/{slug}/availability?serviceId=…&date=…',
    tables: 'staff_schedules, schedule_overrides, bookings',
  },
  {
    step: '5',
    call: 'POST /api/bookings + Idempotency-Key',
    tables: 'customers, bookings, booking_services',
  },
  { step: '6', call: 'PUT /api/bookings/{id}/status', tables: 'bookings.Status' },
];

export function HighlightsPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-widest text-brass-deep">Product notes</p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">How Booked. works</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft leading-relaxed">
          Booked. is an appointment booking app for service businesses: customers book real
          slots from a public page, and staff manage those bookings from a weekly calendar.
        </p>

        <section className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-slate">Features</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature.title} className="card">
                <h3 className="font-display text-lg font-semibold text-ink">{feature.title}</h3>
                <p className="mt-1 text-sm text-slate leading-relaxed">{feature.line}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-slate">Tech stack</h2>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            {stack.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-slate">One real request flow</h2>
          <ol className="mt-4 space-y-3">
            {flow.map((item) => (
              <li key={item.step} className="card">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4">
                  <span className="font-mono text-sm font-semibold text-brass-deep">{item.step}</span>
                  <code className="break-all font-mono text-sm text-ink">{item.call}</code>
                </div>
                <p className="mt-2 text-xs text-slate">Writes/reads: {item.tables}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-slate">One design decision</h2>
          <div className="card mt-4">
            <h3 className="font-display text-lg font-semibold text-ink">Let the database enforce no-overlap</h3>
            <p className="mt-2 text-sm text-slate leading-relaxed">
              Two customers can be looking at the same slot at the same moment. Application-level
              checks can pass for both before either row is written, so the final guard is a
              PostgreSQL exclusion constraint on <code className="font-mono">(StaffId, tstzrange(StartTime, EndTime))</code>.
              The loser of the race gets a constraint violation, which the API maps to 409 instead of
              a 500.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-slate">What I would improve next</h2>
          <ul className="mt-4 space-y-2 text-sm text-ink-soft">
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" aria-hidden="true" />
              <span>Invalidate the availability cache when schedules or overrides change; it currently lives for 60 seconds.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" aria-hidden="true" />
              <span>Persist and rotate refresh tokens server-side so revoke actually ends a session.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" aria-hidden="true" />
              <span>Live calendar updates instead of a manual refresh.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" aria-hidden="true" />
              <span>Payments and reminder messages are not implemented; the app only records bookings today.</span>
            </li>
          </ul>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link to="/" className="btn-secondary">Back to home</Link>
          <Link to="/login" className="btn-primary">Sign in</Link>
        </div>
      </main>
    </div>
  );
}
