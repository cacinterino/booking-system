# Implementation Plan: Booking Flow

**Branch**: `feat/4.4-booking` | **Date**: 2026-08-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-booking-flow/spec.md`

## Summary

Build the booking lifecycle backend: create booking (guest + authenticated),
idempotent retries, my-bookings list, cancel, reschedule, admin/staff list +
calendar, and staff status transitions. The core guarantee — when two
simultaneous bookings race for the same slot, exactly one succeeds and the
other gets a clean 409, never a 500 — is delivered by a new PostgreSQL overlap
`EXCLUDE` constraint (btree_gist + `tsrange` on (StaffId, StartTime, EndTime))
combined with the existing idempotency-key unique index and a live availability
re-check before persist. Guests can book with contact details and a lookup
code; confirmation is recorded in-system only in this slice.

## Technical Context

- **Language**: C# 12 / .NET 9
- **Primary Dependencies**: ASP.NET Core 9, MediatR, EF Core 9 + Npgsql; the
  repo already uses FluentValidation (validators are tested standalone, not
  wired into DI — keep that convention)
- **Storage**: PostgreSQL 16, feature repositories against `BookingDbContext`
- **Testing**: xUnit + FluentAssertions + Moq (unit); Testcontainers
  PostgreSQL + Respawn (integration)
- **Target Platform**: Web API on Docker :5000 (client React is a separate
  slice)
- **Project Type**: web-service backend feature
- **Performance Goals**: create path stays under 1s p95 (live availability
  re-check + insert)
- **Constraints**: UTC storage with Manila conversion only at the DTO boundary
  (constitution V); availability listing cache cannot trust the stale TTL
- **Scale/Scope**: per-business scope (businessId claim); guest + customer
  creation; single deployment

## Constitution Check

*GATE: passed before research. Re-checked after Phase 1 design (see end).*

| Rule | Status |
| --- | --- |
| III. Zero double-booking | PASS — DB EXCLUDE + idempotency index + 409 mapping, concurrency-tested |
| II. Availability integrity | PASS — engine untouched, tests preserved, writes re-evaluate live |
| IV. Domain purity | PASS — new `Booking.AccessCode` only; no framework deps |
| V. Timezone | PASS — UTC stored (verify timestamptz), Manila at DTO only |
| Security (human review) | PASS — owner checks + role policies; flagged for review |
| Workflow | PASS — feature branch and PR, tests before merge |

## Project Structure

```
specs/001-booking-flow/
├── spec.md             # SPEC (already ratified)
├── plan.md             # this file
├── research.md         # Phase 0 output
├── data-model.md       # Phase 1 output
├── quickstart.md       # validation guide
└── contracts/booking-api.md   # API contract

src/Booking.Domain/
└── Booking.cs                      # + AccessCode (guest lookup code)

src/Booking.Application/
├── Bookings/
│   ├── Commands/BookingCommands.cs          # Create, Cancel, Reschedule, SetStatus
│   ├── Queries/BookingQueries.cs            # MyBookings, List, Calendar, GetById
│   ├── DTOs/BookingDtos.cs                  # Request/Response records
│   ├── Handlers/BookingCommandHandlers.cs, BookingQueryHandlers.cs
│   ├── Interfaces/IBookingRepository.cs, IAvailabilityCache.cs
│   └── Validators/BookingRequestValidator.cs, RescheduleValidator.cs
├── Availability/
│   └── Handlers/GetAvailabilityQueryHandler.cs   # refactor to IAvailabilityCache
├── Services, Staff, Auth           # unchanged
src/Booking.Infrastructure/
├── Persistence/
│   ├── Configurations/BookingConfiguration.cs # AccessCode, verify timestamptz
│   ├── Repositories/BookingRepository.cs, AvailabilityCache.cs
│   └── Migrations/<new>_AddBookingAccessCodeAndOverlapConstraint.cs
└── DependencyInjection.cs          # register new services
src/Booking.Api/
└── Controllers/BookingsController.cs

tests/Booking.UnitTests/
├── Bookings/BookingCommandHandlerTests.cs     # mocked repo; clean 409s
├── Bookings/BookingValidatorTests.cs
└── Availability/ (existing engine tests untouched)
tests/Booking.IntegrationTests/
└── Bookings/BookingConcurrencyTests.cs        # Testcontainers: parallel 409
```

**Structure Decision**: Reuse the existing four-layer solution layout; add a
`Bookings` feature folder under `Booking.Application`, `BookingRepository` +
`AvailabilityCache` in Infrastructure, a controller + `api/bookings` in Api.
No client changes in this slice.

## Phase 0 research — key decisions

1. **Double-booking guard** = PostgreSQL `EXCLUDE USING gist (StaffId WITH =,
   tstzrange("StartTime","EndTime") WITH &&)` (+ `btree_gist`) via raw-SQL EF
   migration. Option B (serializable tx) rejected — DB-level is stronger, per
   plan doc.
2. **Idempotency**: reuse existing unique index; any duplicate insert catches
   `PostgresException 23505` and returns the existing booking (200).
3. **Write path**: re-runs live availability (bypassing cache) via
   `IAvailabilityCache`; conflict → 409.
4. **Guests**: resolve-or-create `Customer` by BusinessId+Email; store
   `AccessCode`; no account required.
5. **409-vs-500**: map exclusion violation (23P01) → 409; unique violation
   (23505) → cached idempotent 200; everything else surfaces as-is.

## Phase 1 outputs

- `data-model.md` — Booking field access, exclusion migration snippet, cache
  invalidation, state transition matrix.
- `contracts/booking-api.md` — full endpoint contract + DTO shapes.
- `quickstart.md` — runnable validation scenarios incl. the race.

## Constitution Re-Check (post-design)

Checked the same table above after Phase 1. All items still pass; V requires
verifying the EF column type for `timestamptz` at implementation time. No
violations to justify in Complexity Tracking.

> Complexity Tracking: n/a (no violations).

## Done When

Plan artifacts written and gates pass; next step is `/speckit.tasks`.