# Research: Public Booking Wizard

**Branch**: `feat/6.1-booking-wizard` | **Date**: 2026-08-15 | **Spec**: [spec.md](./spec.md)

Consolidated findings from exploration of the existing API surface and the constitution constraints. All unknowns from the plan's Technical Context are resolved here.

## 1. Public business lookup by slug

**Decision**: Add `GetPublicBusinessQuery(slug)` handler + `PublicBusinessResponse` DTO; resolve via the existing `IBusinessRepository.GetBySlugAsync`.
**Rationale**: The repository method already exists (used by onboarding), `Business.Slug` is unique-indexed, and `Business.Settings` already carries everything the wizard must show (`RequireDeposit`, `DepositAmount`, `Currency`, `AdvanceBookingDays`, `SlotIntervalMinutes`, `Timezone`). No domain change needed (constitution IV — domain purity).
**Alternatives considered**: Exposing the staff-only `WorkspaceResponse` publicly — rejected, it is scoped to authenticated staff and leaks internal shape. Adding a slug field to services/staff routes — rejected, businessId is resolved once from the slug and passed to all existing queries.
**Unknown surfaced**: `Business` has no logo field, so the wizard presents the business by name/description only (recorded in spec assumptions).

## 2. Public services list

**Decision**: Reuse the existing `GetServicesQuery(BusinessId, IncludeInactive: false)` and `ServiceResponse` as-is.
**Rationale**: `ServiceResponse` (Id, Name, Description, DurationMinutes, Price, CategoryId, CategoryName, BusinessId, IsActive, DisplayOrder, Color) contains no PII and is exactly the data the service step needs. `GetServicesQueryHandler` filters `IsActive` when `IncludeInactive=false`.
**Alternatives considered**: A bespoke public service DTO — rejected as needless duplication; nothing private in the existing shape.

## 3. Public staff list

**Decision**: New `PublicStaffResponse` (Id, FullName, ServiceIds, DisplayOrder) produced by an explicit mapper; existing `StaffResponse` untouched.
**Rationale**: RA 10173 data minimisation (constitution Market & Compliance) — `StaffResponse` exposes `Email`, `Phone`, `AvatarUrl`. The public staff picker needs only the staff's name and which services they deliver.
**Alternatives considered**: Nulling email/phone on the existing DTO — rejected, it would misrepresent the DTO contract and risk future consumers reading nullable-but-set values. A distinct record type keeps the boundary explicit and auditable.

## 4. Public availability

**Decision**: Reuse `GetAvailabilityQuery` unchanged; the public controller injects the slug-resolved `BusinessId` instead of the JWT claim.
**Rationale**: The query and handler already take `BusinessId` as a first-class parameter — the current `AvailabilityController` merely sources it from the JWT. `AvailabilityResponse` already returns Manila-local `Start`/`End` strings plus `StartUtc`/`EndUtc`, and slots are cached 1 minute. Zero changes to the availability engine (constitution II — engine integrity).
**Alternatives considered**: Duplicating the handler — rejected; it would fork the core algorithm. Making the existing controller `[AllowAnonymous]` — rejected; the controller's businessId source is auth-dependent and coupling public access to it would require reworking claim resolution.
**Confirmed convention**: Slots step at `BusinessSettings.SlotIntervalMinutes` (15 default) while the booking validator accepts any 5-minute boundary — the client MUST submit only times verbatim from the availability `slots` array (spec FR-006).

## 5. Booking write path (unchanged, reused)

**Decision**: Reuse `POST /api/bookings` as-is.
**Rationale**: It is already `[AllowAnonymous]`, idempotency-key protected, rate limited, and returns clean 409 on slot conflict (constitution III). The wizard needs no changes to it.
**Time discipline**: The handler treats `DateTimeKind.Unspecified` as UTC (`ToUtc`). The wizard sends `startTime` as the UTC ISO-8601 `Z` value from the availability slot's `startUtc` — never a Manila string and never a synthesized time. The contract doc §1's "Manila offset handled internally" claim is stale; UTC-with-`Z` is the safe contract.

## 6. Guest confirmation + lookup

**Decision**: Reuse `GET /api/bookings/my-bookings?accessCode=` for the post-booking "view my booking" flow.
**Rationale**: Already public; returns the guest's bookings with the access code from the confirmation screen. Confirmation screen shows summary + reference + access code (FR-011/FR-012).
**Caveat**: A single access code returns the customer's whole non-cancelled history, not one booking. The wizard's confirmation screen shows the just-created booking; the "view my bookings" surface is scoped to surfacing upcoming bookings (US3) and a dedicated customer dashboard is explicitly out of scope (assumption).

## 7. Deposit communication (deferred payment)

**Decision**: When `BusinessSettings.RequireDeposit` is true, the wizard shows the required deposit amount (from the public business DTO) on the details/confirm step; booking proceeds without payment collection.
**Rationale**: PayMongo (Phase 4.5) is a recorded deferral; `CreateBookingCommandHandler` already computes `TotalAmount` incl. deposit but payment is not collected. FR-013 is satisfied by disclosure.
