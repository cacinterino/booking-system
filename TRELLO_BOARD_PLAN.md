# Trello Board: Appointment Booking System

**Board name suggestion:** `Booking System — Portfolio Build`

## How to set this up in 5 minutes

1. Create a new Trello board with the name above.
2. Create the lists in the order below (left → right): `Backlog`, `Phase 0 – AI Setup`,
   `Phase 1 – Foundation`, `Phase 2 – Data & Auth`, `Phase 3 – Core Features`,
   `Phase 4 – Frontend`, `Phase 5 – Notifications & Polish`, `Phase 6 – Deploy & Document`,
   `Done`.
3. On each list, click the **"..."** menu → **Add cards** → paste the block of card titles
   for that list below. Trello turns each line into its own card automatically.
4. Add labels: 🟩 `must-have`, 🟨 `nice-to-have`, 🟥 `blocked`. Tag the AI/MCP setup cards and
   payment-integration cards as `must-have` given the improvements above.

---

## List: Backlog (stretch goals — pull into a phase list only once core work is done)

```
Redis caching for availability queries
OpenTelemetry tracing
Feature flags for gradual rollout
Waitlist for fully-booked slots
Staff performance dashboard (bookings/no-shows per staff)
Multi-language support (Tagalog/English toggle)
```

## List: Phase 0 – AI Setup

```
Install Claude Code / set up dev environment
Write CLAUDE.md with stack, structure, conventions
Connect GitHub MCP
Connect Postgres MCP (after docker compose up)
```

## List: Phase 1 – Foundation

```
Create GitHub repo + branch protection on main
Scaffold .NET solution (Domain/Application/Infrastructure/Api + tests)
Install core NuGet packages
Scaffold React client (Vite + TS + Tailwind v4)
Write docker-compose.yml (Postgres + API + client)
Verify docker compose up end to end
```

## List: Phase 2 – Data & Auth

```
Define Domain entities (Business, Service, Staff, Booking, Payment, etc.)
Configure EF Core + write initial migration
Add unique/exclusion constraint to prevent double-booking
Implement ApplicationUser + Identity roles (Admin/Staff/Customer)
Implement JWT auth endpoints (register/login/refresh/revoke/me)
Write unit tests for auth logic
Decide + hardcode Asia/Manila timezone handling (store UTC, convert at API boundary)
```

## List: Phase 3 – Core Features

```
Services CRUD endpoints
Staff CRUD + weekly schedule + date overrides
Availability engine (core algorithm)
Availability engine: concurrency/double-booking test
Availability engine: in-memory caching
Booking creation flow (guest + authenticated)
Booking cancel/reschedule endpoints
Admin/staff booking list + calendar view endpoint
PayMongo integration: payment intent + webhook handler
```

## List: Phase 4 – Frontend

```
Axios instance + TanStack Query setup
Auth pages: login, register, profile
Public booking wizard: service -> staff -> date/time -> confirm
Payment step in booking wizard (GCash/Maya via PayMongo)
Customer "My Bookings" page
Staff calendar view (week/day) with SignalR live updates
Admin settings pages (services, staff, business)
Responsive pass + loading/error states
```

## List: Phase 5 – Notifications & Polish

```
Email service integration (SendGrid/Resend)
SMS integration (Semaphore PH)
Booking reminder job (24hr / 1hr)
Rate limit login + booking endpoints
Soft delete on Booking/Customer
Seed script for demo data
```

## List: Phase 6 – Deploy & Document

```
Provision Postgres (Neon/Supabase)
Deploy API (Fly.io/Railway/Render paid tier — avoid free-tier cold starts)
Deploy client to Vercel
Wire up GitHub Actions CI (build + test)
Wire up GitHub Actions CD (API + client)
Write README (architecture diagram, setup, env vars, screenshots)
Write RA 10173 / data-privacy note for README
Write portfolio case study (problem, decisions, challenges, what's next)
Record demo GIF/video
```

## List: Done

*(empty — drag cards here as you finish them)*
