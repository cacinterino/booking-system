# Plan Review — Appointment Booking System

Overall: this is a strong, hire-me-ready plan. Clean Architecture + CQRS is the right call for
a portfolio piece because it's easy to explain in an interview and shows layering discipline.
The 14-day execution order is realistic *if* scope stays fixed. Below are gaps worth closing
before you start Phase 1, grouped by why they matter.

---

## 🇵🇭 1. Market-fit gaps (biggest miss in the original plan)

Your target market is PH clinics/salons/barbershops/spas, but the plan has no payments and no
PH-specific compliance mention. Both are the kind of thing a reviewer in this market notices
immediately.

- **Add GCash/Maya via PayMongo.** Even a "pay ₱100 deposit to hold your slot" flow massively
  reduces no-shows for local service businesses and is the single most "this person understands
  the market" feature you can add. New entity: `Payment` (BookingId, Provider, Status, Amount,
  ProviderRef). New endpoints: `POST /api/bookings/{id}/payment-intent`, PayMongo webhook handler.
- **Data Privacy Act (RA 10173) note in the README.** You're storing customer PII (name, phone,
  email). A one-paragraph "how this system handles the Data Privacy Act" section in your README
  costs nothing and signals maturity to PH employers/clients.
- **Timezone: hardcode `Asia/Manila` as the business timezone**, don't make it configurable in v1.
  Store all timestamps in UTC in Postgres, convert at the API boundary. This is the #1 source of
  "the booking showed up on the wrong day" bugs — decide it now, not in Week 2.

## ⚙️ 2. Technical gaps in the Availability Engine

The engine (4.3) is the core algorithm and the thing worth testing hardest — but the plan doesn't
mention two things that will bite you:

- **Concurrency / double-booking.** Two customers hitting "confirm" on the same slot at the same
  time. Add either a unique constraint (`StaffId`, `StartTime`) with a DB-level exclusion
  constraint, or an idempotency key on `POST /api/bookings` plus a transaction with
  `SERIALIZABLE` isolation on the slot check. Write this as an explicit test case, not an
  afterthought.
- **Caching.** Availability queries will be your most-hit endpoint and involve joining schedules,
  overrides, and bookings. Cache computed slots per staff/day with a short TTL (or invalidate on
  booking write) — in-memory `IMemoryCache` is enough for a portfolio project; mention Redis as
  the "how I'd scale it" answer in your case study.

## 🚀 3. Deployment realism

- **Render's free tier spins down after inactivity** (cold start ~30-50s). That's a bad first
  impression on a live demo link. Either budget for Render's cheapest paid tier for the demo
  period, or move the API to **Fly.io** (better free-tier cold-start behavior) or **Railway**.
  Keep Vercel for the client — that part of the plan is fine.
- **DB choice:** Neon or Supabase both work; Neon's branching feature is a nice thing to mention
  in a case study ("used DB branching for safe schema migrations in CI").

## 🧪 4. Testing scope — right idea, slightly too ambitious

>80% coverage on domain/application in a 2-week solo build is a stretch goal that tends to get
cut silently when you're behind. Reframe it:
- **Must-have:** availability engine unit tests (this is the algorithm people will actually
  read), auth flow integration test, one full booking-lifecycle integration test.
- **Nice-to-have:** everything else, coverage number is a stretch goal you mention as "target"
  not a gate you block deployment on.

## 🔍 5. Small additions worth the 30 minutes each

| Addition | Why |
|---|---|
| Rate limit `POST /api/bookings` and `/api/auth/login` | Cheap abuse prevention, easy to demo |
| Soft delete (`IsDeleted` + query filter) on Booking/Customer | Avoids losing audit trail on cancellations |
| Structured logging with Serilog → include `BusinessId`/`BookingId` in every log line | Makes the "how would you debug this in prod" interview answer concrete |
| A seed script / `dotnet run --seed` | Lets anyone clone the repo and see real data in under a minute — huge for demo quality |
| OpenTelemetry basic tracing (optional) | Good "what I'd add next" line in the case study even if not fully wired |

---

## Suggested phase renumbering

Keep your existing Phases 1–9 as-is — they're good. Insert one new phase before everything else:

**Phase 0: AI-Accelerated Dev Setup (Day 1, before scaffolding)** — see the dedicated section
below. Setting this up first is what makes the 14-day timeline actually achievable.

Everything else in your original plan (architecture, entities, endpoints, CI/CD, docs) stays as
written — it's solid.
