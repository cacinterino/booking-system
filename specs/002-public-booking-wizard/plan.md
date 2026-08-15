# Implementation Plan: Public Booking Wizard

**Branch**: `feat/6.1-booking-wizard` | **Date**: 2026-08-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-public-booking-wizard/spec.md`

## Summary

Build the guest-facing side of booking: a public, slug-scoped discovery API that lets an anonymous visitor resolve a business, browse its active services, see eligible staff (contact details hidden), and query real availability — plus the wizard frontend that turns that into a no-account booking flow. The booking write path (`POST /api/bookings`, idempotency key, 409 race handling, guest access code) and guest lookup (`GET /api/bookings/my-bookings?accessCode=`) already exist and are public; this slice adds the missing discovery endpoints and the client UI. Sequencing: **backend discovery endpoints first (this commit), wizard UI second**, per the repo's one-slice-per-session rule.

## Technical Context

- **Language**: C# 12 / .NET 9 (API); TypeScript 5 / React 18 (client)
- **Primary Dependencies**: ASP.NET Core 9, MediatR, EF Core 9 + Npgsql; client uses Vite + React Router + TanStack Query + Tailwind v4
- **Storage**: PostgreSQL 16; existing `BookingDbContext` + repositories
- **Testing**: xUnit + FluentAssertions + Moq (unit); Testcontainers PostgreSQL + Respawn (integration)
- **Target Platform**: Web API on Docker :5000; React client on :5173
- **Project Type**: web-service + SPA feature
- **Performance Goals**: public discovery queries cached ≤1 min (reuse availability cache); wizard time-to-booking < 2 min
- **Constraints**: UTC storage, Manila conversion at DTO boundary only (constitution V); RA 10173 — no staff contact PII on public responses (constitution Market & Compliance); availability engine untouched (constitution II); guest-only contacts (FR-007)
- **Scale/Scope**: public (anonymous) read endpoints + one wizard UI surface; no auth changes

## Constitution Check

*GATE: passed before research. Re-checked after Phase 1 design (see end).*

| Rule | Status |
| --- | --- |
| I. Spec-first | PASS — this plan derives from the ratified spec |
| II. Availability integrity | PASS — engine untouched; public endpoint reuses existing query, engine tests preserved |
| III. Zero double-booking | PASS — write path untouched (already shipped); this slice adds read paths only |
| IV. Domain purity | PASS — no domain changes (Business.Settings already exists) |
| V. Timezone | PASS — reuse existing availability mapping; UTC stored, Manila at DTO |
| RA 10173 (data minimisation) | PASS — new public staff DTO strips Email/Phone/AvatarUrl PII |
| Security (human review) | PASS — `[AllowAnonymous]` on read-only public routes only; no write or role changes |
| Workflow | PASS — feature branch `feat/6.1-booking-wizard`, tests before merge, PR |

## Project Structure

```
specs/002-public-booking-wizard/
├── spec.md             # SPEC (ratified)
├── plan.md             # this file
├── research.md         # Phase 0 output
├── data-model.md       # Phase 1 output
├── quickstart.md       # validation guide
└── contracts/booking-public-api.md   # public endpoint contract

# BACKEND (this commit)
src/Booking.Application/
├── Business/
│   ├── DTOs/BusinessDtos.cs              # + PublicBusinessResponse (name, desc, slug, settings)
│   └── Queries/WorkspaceQueries.cs       # + GetPublicBusinessQuery (by slug)
│   └── Handlers/WorkspaceQueryHandler.cs # + GetPublicBusinessQueryHandler
├── Services/
│   └── DTOs/ServiceDtos.cs               # reuse ServiceResponse as-is (no PII)
├── Staff/
│   └── DTOs/StaffDtos.cs                 # + PublicStaffResponse (no email/phone/avatar)
└── Availability/                         # reuse GetAvailabilityQuery unchanged
src/Booking.Infrastructure/
└── Persistence/Repositories/             # reuse BusinessRepository.GetBySlugAsync
src/Booking.Api/
└── Controllers/PublicBookingController.cs  # NEW [AllowAnonymous] slug-scoped read endpoints

tests/Booking.UnitTests/
├── Business/PublicBusinessQueryTests.cs   # slug resolve, not-found, settings mapped
├── Staff/PublicStaffMapperTests.cs        # PII stripped
└── (reuse existing service/availability tests)

# CLIENT (next commit)
booking-client/src/
├── features/booking/
│   ├── api.ts, types.ts, hooks.ts
│   ├── BookingWizardPage.tsx
│   └── components/ (ServiceStep, StaffStep, DateTimeStep, DetailsStep, ConfirmationStep)
└── App.tsx            # + route /book/:businessSlug
```

**Structure Decision**: Reuse the four-layer solution layout. Backend adds one `[AllowAnonymous]` `PublicBookingController` under `api/public/businesses/{slug}/...` that resolves slug → businessId then dispatches existing query handlers (services, staff, availability) with a new public business DTO and a PII-stripped staff DTO. The wizard UI is a new `features/booking` module on the client. Backend ships first as its own commit; client is the following commit.

## Phase 0 research — key decisions

1. **Slug → business**: `IBusinessRepository.GetBySlugAsync` already exists; add a `GetPublicBusinessQuery(slug)` handler returning a new `PublicBusinessResponse` (name, description, slug, timezone, and business settings: `RequireDeposit`, `DepositAmount`, `Currency`, `AdvanceBookingDays`, `SlotIntervalMinutes`). 404 on unknown slug.
2. **Public services**: reuse `GetServicesQuery(BusinessId, IncludeInactive: false)`; `ServiceResponse` exposes no PII so it is safe as-is.
3. **Public staff**: `GetStaffByServiceQuery`/`GetStaffQuery` return `StaffResponse` which includes Email/Phone/AvatarUrl. New `PublicStaffResponse` (Id, FullName, ServiceIds, DisplayOrder) via an explicit mapper; existing DTO untouched.
4. **Public availability**: reuse `GetAvailabilityQuery` unchanged — it already takes `BusinessId` first-class; the current controller injects the JWT claim, the public controller injects the slug-resolved id. Slots already returned in Manila local strings + UTC.
5. **Time discipline**: always take `startTime` for `POST /api/bookings` from the availability response's `startUtc` (send UTC ISO with `Z`) — the handler treats naive datetimes as UTC and the contract doc is stale. Never synthesize slot times client-side.
6. **RA 10173**: only name and non-PII identity appear on public staff; no contact details, no avatar.

## Phase 1 outputs

- `data-model.md` — public DTO shapes, settings mapping, staff PII boundary, cache keys.
- `contracts/booking-public-api.md` — public endpoint contract + DTO shapes.
- `quickstart.md` — runnable validation scenarios for the public discovery flow + wizard.

## Constitution Re-Check (post-design)

Checked the same table above after Phase 1. All items still pass. Availability engine and write path untouched; only read paths + new public DTOs added; no auth/role changes. No violations to justify in Complexity Tracking.

> Complexity Tracking: n/a (no violations).

## Done When

Plan artifacts written and gates pass; next step is `/speckit.tasks`.
