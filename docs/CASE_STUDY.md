# Case Study: Booked.

## Problem

Small service businesses in the Philippines — salons, clinics, barbershops, spas — usually take bookings through phone calls, DMs, and a paper diary. That produces three recurring problems:

- Customers cannot see which slots are actually open, so they call to ask.
- Two customers can be given the same slot, especially when more than one staff member takes bookings.
- Nobody can tell, at a glance, what the day looks like across the team.

## What I built

A booking app with two sides:

**Customers** open a public page (`/book/:businessSlug`), choose a service and a staff member, pick a date, and select from real open slots computed for that day. Booking requires no account. The confirmation returns an access code (`8F3K-2Q7X`), which the guest uses at `/my-bookings` to review, reschedule, or cancel.

**Staff** sign in, see this week's booking counts and pending confirmations on `/dashboard`, and work the week from `/staff/calendar` — confirming, completing, marking no-shows, or cancelling. Admins manage services (duration, price, active flag, staff assignment) and staff (weekly hours, date overrides, service eligibility).

## Stack and why

| Layer | Choice | Reason |
|-------|--------|--------|
| API | ASP.NET Core 9 | Strong typing, first-class EF Core and Identity support, easy to test |
| Structure | Clean Architecture + MediatR (CQRS) | Domain stays free of EF/MediatR, so domain rules are testable without a database |
| Data | PostgreSQL 16 + EF Core 9 | Exclusion constraints do the double-booking guard properly; EF Core handles migrations and mapping |
| Auth | ASP.NET Core Identity + JWT | Standard, and the refresh-token flow is a good thing to be able to explain |
| Client | React 19 + TypeScript + Vite | Fast local feedback; types catch API-shape mistakes |
| Server state | TanStack Query | Caching and refetching per query key without a hand-rolled store |
| Styling | Tailwind CSS v4 | Design tokens in CSS variables; no component library to fight |
| Tests | xUnit, Moq, FluentAssertions, Testcontainers, Vitest | Unit tests for the engine, real Postgres for the concurrency guarantee |

## Design decisions worth defending

### 1. The database is the final word on double-booking

Two customers can view the same slot and submit at the same moment. Both can pass an application-level "is this free?" check before either row is written. So the last line of defence is a PostgreSQL exclusion constraint on the staff member's booked time range:

```sql
EXCLUDE USING gist ("StaffId" WITH =, tstzrange("StartTime", "EndTime", '[)') WITH &&)
WHERE ("Status" IN (1, 2) AND NOT "IsDeleted")
```

The half-open `[)` range means 10:00–10:45 and 10:45–11:30 do not collide. The losing request gets a constraint violation, which the API maps to `409 Conflict` rather than a `500`. `BookingConcurrencyTests` fires two concurrent creates at one slot and asserts exactly one `201`.

### 2. Availability is computed, never stored

There is no `slots` table. `GetAvailabilityQuery` takes the requested Manila date, reads the staff member's weekly schedule and date overrides, subtracts existing non-cancelled bookings, then walks forward in `SlotIntervalMinutes` steps while the service still fits before closing time. This means a schedule change or a cancellation is reflected without any backfill job — the only staleness is a 60-second in-memory cache.

### 3. UTC in the database, Manila at the edges

Every timestamp is stored in UTC. Conversion to `Asia/Manila` happens in the DTO mapper (`BookingDtoMapper.ToManila`) and in the client formatters. The availability engine converts the requested local date into a UTC window before querying, which avoids the classic "booked the wrong day" bug near midnight.

### 4. Guest access without accounts

Requiring registration to book would lose most customers. Instead, `POST /api/bookings` accepts an optional guest contact block and returns an access code. Lookup resolves the code to that customer record and returns only that customer's bookings. An invalid code returns `401`, and there is no endpoint that lists bookings by guessable identifiers.

## Challenges

**Concurrency** — solved as above; the interesting part was mapping the Postgres exception to a clean 409 in middleware instead of letting it surface as a 500.

**Timezone edges** — availability for a Manila date spans two UTC days. Handled by converting the local day boundaries to UTC before the booked-interval query, with explicit handling for unusual `DateOnly` sentinels.

**Authorization boundaries** — a staff member may only read their own calendar; an admin may read any staff member's calendar in their business; a customer may only read bookings linked to their user id or access code. These are enforced in the handlers, not just hidden in the UI.

**Roles were never seeded** — a fresh database failed on `register-business` because the `Admin` role did not exist. Startup now seeds `Admin`, `Staff`, and `Customer` idempotently.

## What I would improve next

1. **Invalidate the availability cache on write.** It currently expires after 60 seconds, so a schedule change can appear stale.
2. **Persist refresh tokens.** They are signed JWTs today, so revoke cannot invalidate an issued token; a token table with rotation and reuse detection would fix that.
3. **Payments and reminders.** There are `Payment` and `Notification` entities but no handler calls them. Deposits via PayMongo and reminder scheduling are the obvious next slice.
4. **Live calendar updates.** Staff currently refresh to see new bookings.
5. **Run tests in CI.** No workflow is committed yet, so nothing gates merges automatically.

## Demo

Runs locally: `docker compose up --build`, then http://localhost:5173. Demo login `demo@booked.local` / `Demo123!`, demo business at `/book/booked-demo`. See `README.md` and `docs/DEMO_SCRIPT.md`.

## Data privacy (RA 10173)

The app stores name, email, optional phone, and booking details to deliver the appointment. Bookings and customers are soft-deleted rather than hard-deleted to retain an audit trail, and global query filters keep deleted rows out of normal reads. A business sees only its own records; a guest needs the access code to see a booking. No third-party analytics receive booking data; the only outbound integration is SendGrid, and it is disabled when no API key is configured (the reset link is printed to the local console instead).
