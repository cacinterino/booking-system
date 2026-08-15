# Research: Booking Flow

**Date**: 2026-08-08 | **Spec**: [spec.md](./spec.md) | **Branch**: `feat/4.4-booking`

## 00. Scope of research

Resolves unknowns in the technical context before Phase 1 design. Each item
records a decision, rationale, and alternatives.

---

## Decision 1 — Double-booking protection mechanism

**Decision**: PostgreSQL EXCLUDE constraint on the bookings table
(`EXCLUDE USING gist (StaffId WITH =, tstzrange(StartTime, EndTime) WITH &&)`)
backed by `CREATE EXTENSION IF NOT EXISTS btree_gist`, delivered as a raw
SQL EF migration. Combined with the existing unique `IX_bookings_IdempotencyKey`.

**Rationale**:
- Declarative, enforced by the database — works even for two servers / any
  future caller and cannot be bypassed by app logic.
- `(StaffId, StartTime)` is NOT unique in general (two bookings can share a
  start at different times? no — overlap check needs ranges). A plain unique
  index cannot express "no overlapping ranges for the same staff". The EXCLUDE
  constraint is the correct primitive and is plan Option A from the remaining
  tasks document.
- Constitution principle III requires BOTH idempotency key and a hard
  structural guarantee; the constraint supplies the hard guarantee.

**Alternatives considered**:
- Option B (application-level serializable isolation transaction + unique
  index): weaker, depends on every future code path remembering to use the
  same isolation level; rejected because the plan explicitly prefers A and the
  constitution requires a structural guarantee.
- Check-then-insert in two steps without any constraint: rejected — racy.

**Details to carry into data model**:
- The columns `Booking.StartTime` / `Booking.EndTime` must be stored as
  `timestamp with time zone` (Npgsql: use `DateTime` with `Kind=Utc` persisted
  via `timestamptz`) so `tstzrange` semantics are correct.
- Migration needs `migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS btree_gist;")`
  before the constraint, and must drop/recreate on revert.
- Conflict surfaces as Postgres error `23P01` (`exclusion_violation`) via
  Npgsql `PostgresException`. Map to a clean `409 Conflict` in the API.

---

## Decision 2 — Idempotency semantics

- **Decision**: `POST /api/bookings` REQUIRES an `Idempotency-Key` header
  (GUID/ULID string). On conflict with an existing booking carrying the same
  key, return the existing booking (200) instead of creating a duplicate.
- **Rationale**: The unique index `IX_bookings_IdempotencyKey` already exists
  (filtered on `IsDeleted = false`). Reusing it meets FR-004 right now
  without a new index. Retry-safe shipping behavior: retry-after-timeout
  returns the first result rather than a confusing duplicate.
- **Implementation note**: check-then-insert has a race; the real guard is
  the unique index — handler catches `Npgsql.PostgresException 23505` and
  replies with the existing booking (looked up by key). No application
  lock needed.

---

## Decision 3 — Re-check availability on write

- **Decision**: The create, reschedule handler does a **live** availability
  evaluation (fresh repository read, bypassing the IMemoryCache) before
  persisting, using the exact `AvailabilityEngine` used for reads.
- **Rationale**: FR-006; and the public listing may be up to 1 minute stale
  due to the TTL, so the write path cannot trust the cache. If the engine's
  live answer says "not available", respond `409 Conflict`.
- **Cache**: introduce a thin `IAvailabilityCache` wrapper around
  `IMemoryCache` (currently inlined in `GetAvailabilityQueryHandler`) that
  exposes `Get / Set / Invalidate(businessId, staffId, startDate, endDate)`.
  Write paths (create/cancel/reschedule/status) invalidate the affected day
  range so listing reflects the change immediately and Constitution FR-01
  "reflect immediately" holds; the exclusion constraint still enforces
  correctness even if a stale key slips through.

---

## Decision 4 — Guest booking & customer identity

**Context**: Spec FR-015 decided Q1=A: guests can book. No `Customer` row is
created for `Customer`-role users today (`RegisterCommandHandler` only
creates an `ApplicationUser`).

**Decision**:
- An authenticated customer role booking resolves the `ApplicationUser.Id`
  claim and upserts (or reuses by `BusinessId+Email` / `UserId`) a
  `Customer` entity so bookings link to a stable `CustomerId`.
- Guest bookings (no JWT) carry `guestContact` (`name` + `email`, optional
  `phone`) in the request. A `Customer` is resolved-or-created by
  `(BusinessId, Email)` (the existing filtered unique index); identity privacy
  remark: no account is created, just a `Customer` record. Guest booking is
  rejected if contact looks fabricated — basic validation only (format
  checks, zero personal data handling outside the RA 10173 constraints).
- A short random `AccessCode` is stored on the booking for guests so they can
  later retrieve/cancel via `GET /api/bookings/my-bookings?accessCode=` from
  a non-technical view. Emails/SMS delivery is out of scope for this slice
  (the confirmation is recorded in-system only).

**Alternatives**: requiring an account for every booking (rejected — spec
Q1=A). Storing contact on `Booking` directly (rejected — `Customer` entity
already exists and supports the flow and allows reuse).

---

## Decision 5 — My-bookings, cancel, reschedule, staff/admin

- **Decision**:
  - `GET /api/bookings/my-bookings` → `[Authorize(Policy="CustomerOnly")]`,
    reads current user id, returns booked rows (upcoming first, past after).
  - `POST /api/bookings/{id}/cancel` → allowed for owner (guest by access
    code, customer by CustomerId, staff/admin any) — status → Cancelled,
    reason optional, invalidates cache.
  - `POST /api/bookings/{id}/reschedule` → owner only; re-runs live
    availability + exclusion constraint; on conflict 409 and original
    booking left untouched (`Reschedule` only mutates on successful
    validation in the handler — the domain `Reschedule()` call happens after).
  - `GET /api/bookings` → admin list, filters by status/staff/date.
  - `GET /api/bookings/calendar?from&to` → staff (and admin) calendar events.
  - `PUT /api/bookings/{id}status` → staff/admin: confirm/complete/no-show;
    Pending→Confirmed, Confirmed→Completed/NoShow via domain guards.
- **Rationale**: matches the spec's user stories, uses the domain lifecycle
  already present on `Booking` (Confirm/Cancel/Complete/MarkNoShow/Reschedule).

---

## Decision 6 — Error semantics (409 vs 500)

**Decision**: reserve clean `409 Conflict` for availability/business-rule
conflicts: slot unavailable, overlapping exclusion violation, permission.
`400` for malformed requests (validation), `404` for unknown id
(entity), `403` for role policy, `401` unauthenticated, `500` only for
unexpected. Handle Postgres `23P01` (exclusion) and `23505` (unique
idempotency) explicitly so they surface as 409/200 as designed — the
concurrency requirement (never a 500 when two bookings race for one slot)
is asserted by tests.

**Rationale**: the constitution mandates "system must never produce a 500
when two simultaneous bookings race" — the handler must catch the constraint
violation and translate it, not let it bubble.

---

## Decision 7 — Frontend scope

**Decision**: This plan produces backend-only API surface + integration/unit
tests. The customer-facing booking wizard and my-bookings screens are a
separate feature spec (Phase 6 in remaining tasks). No `booking-client`
changes here except optionally `bookingsApi` in shared api if provided — but
not required for this slice's definition of done.

---

## Dependency notes

- Requires an existing `Customer` + `Booking` + `BookingService` identity
  configuration and repository — all present.
- Reuses the `AvailabilityEngine` static class (will need an in-context
  readonly read of `ScheduleOverride`/`StaffSchedule`, which `IAvailabilityRepository` already supplies).
- `IDateTimeProvider` used for `UtcNow` — must be the sole clock in handlers;
  the availability handler already does Manila conversion at the boundary and
  the plan keeps that pattern.