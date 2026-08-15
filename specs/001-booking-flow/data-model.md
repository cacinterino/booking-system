# Data Model: Booking Flow

**Date**: 2026-08-08 | **Feature**: [spec.md](./spec.md)

Entities below are the ones this feature reads or writes. `Business`, `Service`,
`Staff`, `Customer`, `Availability` inputs already exist in the codebase; the
key additions are the booking lifecycle wiring, the write-path cache
invalidation, and the DB-level overlap constraint.

## Booking

Already defined in `src/Booking.Domain/Booking.cs`; this feature consumes its
existing lifecycle API. No domain changes required except where noted.

| Field | Type | Notes |
|-------|------|-------|
| Id | Guid | inherited from `Entity` |
| BusinessId | Guid | reference to `Business` |
| ServiceId | Guid | reference to `Service` (snapshot also kept in `BookingService`) |
| StaffId | Guid | reference to `Staff` |
| CustomerId | Guid | reference to `Customer` |
| StartTime | DateTime (Utc, timestamptz) | stored UTC |
| EndTime | DateTime (Utc, timestamptz) | stored UTC |
| Status | BookingStatus (Pending..NoShow) | persistence via `HasConversion<int>()` |
| Notes | string? | free text |
| CancellationReason | string? | set by cancel |
| IdempotencyKey | string | unique filtered index already exists |
| TotalAmount / DepositAmount | decimal | defaults populated from service; deposit flow is optional (off by default) |
| ConfirmedAt / CancelledAt / CompletedAt | DateTime? | set by transitions |
| AccessCode | string? | NEW — guest booking access/lookup code |
| Services | IReadOnlyCollection<BookingService> | snapshot of name/duration/price |
| IsDeleted | bool | global query filter |

**New field**: `AccessCode` (first for the flow) — random short code for guest
lookup, nullable (null for authenticated customers). Add to `Booking` entity +
`BookingConfiguration`.

## 2. Customers (write path)

`Customer` exists in `Booking.Domain/Customer.cs` with `UserId`, `Email`, and
`AssignUser(Guid)` support. This feature needs a **resolve-or-create** flow:

- Authenticated customer: find by `(BusinessId, Email)` or `UserId`; upsert if
  missing.
- Guest: find `Customer` by `(BusinessId, Email)` (existing filtered unique
  index), else create.

No schema change required to `Customer`.

## 3. Database-level guarantees

### Overlap exclusion constraint (new migration)

Raw SQL migration (`CreateBookingOverlapConstraint`), ordered after the
initial-create migration:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Bookings"
  ADD CONSTRAINT "EX_bookings_StaffTime_SpecNo"
  EXCLUDE USING gist (
    "StaffId" WITH =,
    tstzrange("StartTime", "EndTime", '[]') WITH &&
  );
```

- Blocks overlapping time ranges for the same staff.
- `tstzrange` hinges on StartTime/EndTime being persisted as `timestamptz`.
  Verify the EF `HasColumnType("timestamp with time zone")` — the availability
  handler already converts to UTC; the DB column must match so `tstzrange`
  works correctly. If the current columns are `timestamp without time zone`,
  add `HasColumnType("timestamp with time zone")` to the booking config and
  regenerate — this must be decided before implementing (raise if you find it
  differs).
- Guard: the exclusion fires for overlapping rows **when inserted**; the 
  deletes (cancel/reschedule old slot) free a range by invalidating the cache.
- Only Pending/Confirmed rows should exclude each other: add
  `WHERE "Status" IN (1, 2)` to the constraint definition so cancelled and
  completed rows do not block new bookings.
- Revert order in Down: drop constraint, drop extension `btree_gist` if no
  other user.

### Idempotency (existing)

`IX_bookings_IdempotencyKey` unique filtered `"IsDeleted" = false` — no change.

## 4. Cache invalidation keys

Availability is cached in-memory (1-minute TTL). Introduce
`IAvailabilityCache` (wrap `IMemoryCache` in Infrastructure) exposing:

- `GetOrCreate(CacheKey)` → `AvailableDay?`
- `Invalidate(businessId, staffId, startDate, endDate)`

`CacheKey` = `{region}:{businessId}:{serviceId}:{staffId-or-any}:{Date}` (match
the current read-handler key). Write paths invalidate the date range touched by
the booking (the full day of create, cancel, reschedule old & new day, status
change) — the read handler falls back to recompute.

## 5. API surface (contracts)

See `contracts/booking-api.md` for the full contract.

| Endpoint | Auth | Purpose |
|----------|------|---------|
| POST /api/bookings | Public or JWT | Create booking (guest or customer) + idempotency |
| GET /api/bookings/my-bookings | Customer (or guest accessCode | Current customer's bookings |
| POST /api/bookings/{id}/cancel | Owner / staff / admin | Cancel booking |
| POST /api/bookings/{id}/reschedule | Owner | Reschedule (re-check availability) |
| GET /api/bookings | Admin | List all bookings with filters |
| GET /api/bookings/calendar | Staff / Admin | Calendar events |
| PUT /api/bookings/{id}/status | Staff / Admin | Confirm / Complete / NoShow |

## 6. State transition matrix (authoritative)

| From | Event | To | Guard |
|------|-------|----|-------|
| Pending | Confirm | Confirmed | pending only |
| Pending | Cancel | Cancelled | not already cancelled/completed |
| Pending | Reschedule | Pending (new times) | availability |
| Confirmed | Cancel | Cancelled | not already cancelled/completed |
| Confirmed | Complete | Completed | only confirmed |
| Confirmed | NoShow | NoShow | only confirmed |
| Confirmed | Reschedule | Confirmed (new times) | availability |
| Cancelled | — | — | terminal |
| Completed | — | — | terminal |
| NoShow | — | — | terminal |

## 7. Validation

- `CreateBookingRequestValidator` (FluentValidation): service/staff required,
  valid GUID; time must be future and on a configured slot boundary; guest
  name required; guest email must be well-formed if provided; idempotency key
  required non-empty; notes <= 500 chars. Portful bilingual not needed yet.
- Framework not wired to DI (existing convention: validators unit-tested
  standalone); handler orchestrates validation errors as 400.

## 8. Events / notifications

Out of scope (recorded in-system only).