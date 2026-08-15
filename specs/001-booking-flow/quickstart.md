# Quickstart Validation Guide — Booking Flow

**Date**: 2026-08-08 | **Feature**: [spec.md](./spec.md)

Goal: prove the booking flow works end-to-end: create (with idempotency and
double-booking protection), list, cancel, reschedule, staff status, and
calendar. Runs against Docker Postgres via the API.

## Prerequisites

- Docker stack up (Postgres + API on `:5000`).
- Migrations applied: `dotnet ef database update --project src/Booking.Infrastructure --startup-project src/Booking.Api`
  (includes the new exclusion constraint migration).
- A seeded business with a Service, a Staff schedule, and availability output
  from `GET /api/availability`. Either use existing seed/admin from the
  onboarding flow, or create via the Services/Staff/onboarding APIs.
- A customer account (or use guest contact) and an access token as needed.

## Setup commands

```powershell
docker compose up -d
docker compose build api
docker compose up -d api
dotnet ef database update --project src/Booking.Infrastructure --startup-project src/Booking.Api
dotnet test Booking.sln outcalls:///  # unit+integration suites
```

## Validation scenarios (run from repo root)

### 1. Availability gate → create succeeds

1. `GET /api/availability?serviceId=<s>&date=2026-08-14&staffId=<st>` (token:
   staff or admin) → note one open slot, e.g. `10:00`.
2. `POST /api/bookings` with `Idempotency-Key: <uuid-1>`, same service/staff,
   `startTime`: the chosen slot, guest contact → expect `201`, slot gone from
   step 1 listing after cache TTL.

**Expected**: 201; subsequent availability list (after ~1 min or cache
invalidation) no longer offers that slot.

### 2. Idempotent retry (FR-004)

Re-send the exact same `POST /api/bookings` with the same
`Idempotency-Key: <uuid-1>` → expect `200 OK` returning the SAME booking id,
no duplicate row (`SELECT count(*)` stays 1).

### 3. Double-booking race → exactly one 409 (FR-002/003)

Concurrent `POST /api/bookings` to the same open slot with two different
idempotency keys:

```powershell
# fire two parallel requests against same staffId/startTime
```

Expect: exactly one `201 Created`, the other `409 Conflict` with a clean
message (never 500). This is the serializable-test kernel: runs once locally,
and is asserted in `Booking.IntegrationTests.BookingConcurrencyTests`.

### 4. My bookings + guest access

- Customer JWT → `GET /api/bookings/my-bookings` → lists the booking.
- Guest: `GET /api/bookings/my-bookings?accessCode=<code-from-create>` → same.

### 5. Reschedule

5. `POST /api/bookings/{id}/reschedule` `{startTime: <other open slot>}` → `200`
   and listing frees the old slot.
6. Reschedule to the already-taken slot → `409` and original booking kept.

### 6. Staff/admin

7. As staff: `GET /api/bookings/calendar?from=...&to=...` → events list.
8. As staff: `PUT /api/bookings/{id}/status` `{status:"Confirmed"}` → 204;
   then `{"Completed"}` → 204; trying `Completed` from `Pending` → 409.
9. As admin: `GET /api/bookings?dateFrom&dateTo&status` filters.

## Expected end state

- One booking row per successful create; at most one per slot per staff member
  (exclusion discipline proves it — DB rejects overlap).
- No `500`s under any race in the scenarios above.
- All availability invalidation reflected within the caching boundary
  (immediate for write paths via `IAvailabilityCache`).

For schema specifics, see [data-model.md](./data-model.md); for DTO shapes,
see [contracts/booking-api.md](./contracts/booking-api.md).