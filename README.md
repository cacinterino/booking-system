# Booked.

An appointment booking app for service businesses (clinics, salons, barbershops, spas). Customers book a real open slot from a public page, and staff manage those bookings from a weekly calendar. Built as a portfolio project with ASP.NET Core 9, React, and PostgreSQL.

## Screenshots

| Landing | Booking wizard | Staff calendar |
|:-------:|:--------------:|:--------------:|
| _(add a screenshot)_ | _(add a screenshot)_ | _(add a screenshot)_ |

> **Demo recording & evaluation:** See [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) for a 3-minute timed video walkthrough and [`docs/demo-test-cases.csv`](docs/demo-test-cases.csv) for the manual QA test matrix.

## What it actually does

- **Public booking page** (`/book/:businessSlug`) — pick a service, a staff member, a date, and an open slot. No account needed.
- **Availability engine** — combines weekly staff hours, date overrides, service duration, slot interval, and existing bookings into bookable slots per day (Asia/Manila).
- **No double-bookings** — a PostgreSQL exclusion constraint on the staff member's time range rejects overlaps; the second request for the same slot returns `409 Conflict`, not a `500`.
- **Idempotent creates** — `POST /api/bookings` honours an `Idempotency-Key` header, so a retried submit returns the existing booking.
- **Access-code lookup** (`/my-bookings`) — guests get a code (`8F3K-2Q7X`) to view, reschedule, or cancel their appointment. Codes are stored in `localStorage` only if the guest ticks "remember".
- **Business setup** (`/register-business`) — register a business, manage services (name, duration, price, active), manage staff, assign services, set weekly hours and date overrides.
- **Staff calendar** (`/staff/calendar`) — one week at a time, filtered to a staff member or the whole business; confirm, complete, mark no-show, or cancel.
- **Dashboard** (`/dashboard`) — this week's booking counts, pending confirmations, and the next appointment today, all read from the calendar API.
- **Product notes & architecture highlights** (`/highlights`) — interactive walkthrough covering features, the 6-step request lifecycle, database tables, and key engineering decisions.
- **Auth** — ASP.NET Core Identity with JWT access tokens (15 min) and signed refresh tokens (7 days). Refresh tokens are rejected by the bearer middleware; they only work at `POST /api/auth/refresh`.

Not implemented yet: online payments (GCash/Maya), email/SMS reminder scheduling, and live calendar push. The landing page and docs do not claim otherwise.

## Tech stack

| Layer | Technology |
|-------|------------|
| API | ASP.NET Core 9, MediatR, FluentValidation, Clean Architecture (Domain has zero dependencies) |
| Data | EF Core 9 + Npgsql, PostgreSQL 16 |
| Auth | ASP.NET Core Identity, JWT bearer |
| Client | React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query, React Hook Form + Zod, React Router 7 |
| Tests | xUnit, Moq, FluentAssertions, Testcontainers, Respawn; Vitest + Testing Library |
| Local stack | Docker Compose (Postgres, pgAdmin, API, client) |

## Run it

### Option A — Docker Compose (one command)

```bash
docker compose up --build
```

- Client: http://localhost:5173
- API: http://localhost:5000 (health check: http://localhost:5000/api/health)
- pgAdmin: http://localhost:5050 (login: `admin@local.dev` / `admin`)

Migrations run automatically on API startup. Demo data seeds automatically because `Seed__Demo` defaults to `true` in `docker-compose.yml`. To start with an empty database, copy `.env.example` to `.env` and set `SEED_DEMO=false`.

### Option B — native dev servers

Prerequisites: .NET 9 SDK, Node 20+, and PostgreSQL 16 (or just Postgres via `docker compose up -d postgres`).

```bash
# 1. Database only
docker compose up -d postgres

# 2. API on http://localhost:5000, with demo data
dotnet run --project src/Booking.Api --launch-profile http -- --seed

# 3. Client on http://localhost:5173
cd booking-client
npm install
npm run dev
```

The client reads `VITE_API_URL` and falls back to `http://localhost:5000`. CORS defaults to `http://localhost:5173`.

### Demo login

```
email:    demo@booked.local
password: Demo123!
```

`--seed` (or `Seed__Demo=true`) is idempotent: it creates the business `booked-demo`, three services, two staff members, Mon–Sat 09:00–18:00 schedules, a staff training override, and realistic appointments across the current week. To reseed, delete the `booked-demo` business row or recreate the Postgres volume (`docker compose down -v`).

Pre-seeded guest access codes for testing `/my-bookings`:
- `8F3K-2Q7X` (Maria Cruz — Signature Facial — Confirmed)
- `5P2X-L9T4` (Paolo Reyes — Deep Tissue Massage — Pending)
- `9T4E-K7W2` (Angelo David Reyes — Signature Facial — Confirmed)
- `3W8K-P5M9` (Liza Fernandez — Gel Manicure — Confirmed)
- `4L9V-C2K8` (Dave Austin Villanueva — Deep Tissue Massage — Pending)
- `6V4L-P8X3` (Patricia Mae Ramos — Signature Facial — Completed)
- `3M7C-N9K2` (Mark Christian Dizon — Deep Tissue Massage — Cancelled)

Identity roles (`Admin`, `Staff`, `Customer`) are seeded on every startup, because `register-business` assigns the `Admin` role.

## Tests

```bash
# Backend unit tests (83 fast unit tests, no external dependencies)
dotnet test tests/Booking.UnitTests

# Backend integration tests (7 tests, spins up PostgreSQL via Testcontainers — requires Docker)
dotnet test tests/Booking.IntegrationTests

# Run full backend test suite
dotnet test Booking.sln

# Client: 34 component tests (Vitest)
cd booking-client
npm test

# Client type-check + production build
npm run build
```

Coverage worth highlighting:

- `tests/Booking.UnitTests/Availability/AvailabilityEngineTests.cs` — slot generation, overrides, booked intervals, Manila timezone edges.
- `tests/Booking.UnitTests/Domain/BookingLifecycleTests.cs` — legal and illegal status transitions.
- `tests/Booking.IntegrationTests/Bookings/BookingConcurrencyTests.cs` — two simultaneous bookings for one slot: exactly one wins (409 Conflict for the loser).
- `tests/Booking.IntegrationTests/Auth/RefreshTokenTests.cs` — a refresh token cannot be used as a bearer token, and an access token cannot be replayed at `/refresh`.

## API surface (the parts the UI uses)

| Method | Endpoint | Notes |
|--------|----------|-------|
| `GET` | `/api/health` | Liveness + database check |
| `GET` | `/api/public/businesses/{slug}` | Public business profile |
| `GET` | `/api/public/businesses/{slug}/services` | Active services for public booking |
| `GET` | `/api/public/businesses/{slug}/staff?serviceId=…` | Staff members who can perform the service |
| `GET` | `/api/public/businesses/{slug}/availability?serviceId=…&date=…&staffId=…` | Open slots for one Manila date |
| `POST` | `/api/bookings` | Create a booking (anonymous, rate-limited, `Idempotency-Key`) |
| `GET` | `/api/bookings/my-bookings?accessCode=…` | Guest lookup (or the signed-in customer's bookings) |
| `POST` | `/api/bookings/{id}/cancel` | Cancel by access code or owner |
| `POST` | `/api/bookings/{id}/reschedule` | Move to another open slot |
| `GET` | `/api/bookings/calendar?from=…&to=…` | Staff week view |
| `PUT` | `/api/bookings/{id}/status` | Confirm / complete / no-show |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/services` | Service catalog management (Admin) |
| `GET`, `POST`, `PUT` | `/api/staff`, `/api/staff/{id}/schedule` | Staff roster, service assignments, schedules (Admin) |
| `POST` | `/api/auth/register`, `/register-business`, `/login`, `/refresh`, `/revoke` | Auth & business onboarding |
| `GET` | `/api/auth/me` | Current authenticated user profile |

## Configuration

Copy `.env.example` to `.env` for Docker Compose, or use `dotnet user-secrets` / `appsettings.Development.json` for the API. Never commit a filled-in `.env`.

| Key (ASP.NET) | Docker Compose (.env) | Purpose |
|---------------|----------------------|---------|
| `ConnectionStrings__DefaultConnection` | `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | PostgreSQL connection string |
| `Jwt__Key`, `Jwt__Issuer`, `Jwt__Audience` | `JWT_KEY`, `JWT_ISSUER`, `JWT_AUDIENCE` | Token signing and validation |
| `Jwt__AccessTokenExpiryMinutes`, `Jwt__RefreshTokenExpiryDays` | — | Token lifetimes (default: 15 min / 7 days) |
| `AllowedOrigins` | `ALLOWED_ORIGINS` | CORS origin(s) for the client (default: `http://localhost:5173`) |
| `Email__ApiKey`, `Email__From` | — | SendGrid key; when empty the reset link is written to the console |
| `Seed__Demo` | `SEED_DEMO` | `true` seeds the demo business (`booked-demo`) at startup |

## Known limitations

- The availability cache is in-memory with a 60-second TTL and no invalidation, so a schedule change can take up to a minute to show up.
- Refresh tokens are signed JWTs, not rows in a table, so `/revoke` cannot invalidate a token that was already issued.
- No payment, reminder-scheduling, or real-time features.
- No CI workflow is committed yet, so there is no build badge.

## Data privacy (RA 10173)

The app stores a customer's name, email, optional phone number, and booking details so the business can deliver and manage the appointment. Bookings and customers are soft-deleted (`IsDeleted`) rather than hard-deleted, which keeps an audit trail. A business owner can see only their own business's records; guests must present the access code to see a booking. Both `Booking` and `Customer` are filtered by a global query filter.

## Project layout

```
src/Booking.Domain/             # Entities, enums, domain rules (no external packages)
src/Booking.Application/        # Commands, queries, handlers, validators, DTOs
src/Booking.Infrastructure/     # EF Core, repositories, Identity/JWT, email, seeder
src/Booking.Api/                # Controllers, middleware, Program.cs
tests/Booking.UnitTests/        # Fast domain + handler tests (xUnit)
tests/Booking.IntegrationTests/ # WebApplicationFactory + real Postgres (Testcontainers)
booking-client/                 # React 19 app (Vite + Tailwind CSS v4)
docs/                           # Case study, demo script, test matrix
```

More context: [`docs/CASE_STUDY.md`](docs/CASE_STUDY.md), [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md), and [`docs/demo-test-cases.csv`](docs/demo-test-cases.csv).
