# Booking Flow Security Review (T046)

**Date**: 2026-08-08
**Reviewer**: OpenCode (AI first draft) — **must be re-checked by a human before merge** per Constitution.
**Scope**: `src/Booking.Api/Controllers/BookingsController.cs`, `src/Booking.Application/Bookings/*`, `src/Booking.Infrastructure/Persistence/Repositories/BookingRepository.cs`, `src/Booking.Infrastructure/DependencyInjection.cs` (auth policies), `src/Booking.Api/Middleware/ProblemDetailsExceptionHandler.cs`.

---

## 1. Summary

The booking endpoints enforce authorization in three layers: attribute policies (`StaffOrAdmin`), per-booking owner/guest identity checks inside the handlers, and a DB exclusion constraint for slot integrity. No cross-tenant data leak was found in normal flows. One concrete hardening gap (idempotency-key reuse leaking a *different* booking) was found and fixed. Remaining items are documentation/operational notes.

---

## 2. Findings

### 2.1 — FIXED: Idempotency-key reuse must not return a different booking 🟢
- **Location**: `CreateBookingCommandHandler.Handle` (both the pre-check and the `IdempotencyConflictException` race-path re-query).
- **Vulnerability**: The idempotency lookup was keyed only by `(BusinessId, IdempotencyKey)`. If a caller reused a key that already belonged to a **different** request (different slot/service/staff/email), the handler returned that existing booking as a 200 "idempotent retry" — leaking another booking's details (incl. `AccessCode`, customer name, notes, slot) without authorization.
- **Fix**: added `MatchesRequest(existing, request)` — compares `ServiceId`, `StaffId`, `StartTime`, and (when both known) guest `Email`. On mismatch the handler now throws `BookingConflictException` → HTTP 409 with "Idempotency-Key was already used for a different booking". Applied to both the early-return and the race catch.
- **Test**: `Handle_IdempotencyKeyReusedWithDifferentSlot_ThrowsConflict` (returns 409, booking not reused).

### 2.2 — Verified: owner checks (cancel/reschedule) 🟢
- `CancelBookingCommandHandler.EnsureOwnerOrGuestAsync`: authenticated owner must have `Customer.UserId == authenticatedUserId` AND `customer.Id == booking.CustomerId`; otherwise guest path requires `booking.AccessCode == accessCode` (exact match). A third-party with a valid token but a different customer id is rejected (403 before any other side-effect).
- `RescheduleBookingCommandHandler` extends the same gate to also accept staff of the same business (T042). Verified `GetStaffByBusinessAndUserIdAsync` filters by `booking.BusinessId` so cross-business staff cannot act.

### 2.3 — Verified: staff/admin role policy 🟢
- `List`, `Calendar`, `SetStatus` all `[Authorize(Policy = "StaffOrAdmin")]`; policy = `RequireRole("Staff","Admin")` (DependencyInjection.cs:73).
- Business scoping: `GetBusinessId()` reads the signed `businessId` JWT claim; `List/Calendar` query filters by that business. Staff calendar handler additionally restricts non-admins to their own `StaffId`.
- `SetBookingStatus` verifies `IsAdmin` OR staff belongs to the same business.

### 2.4 — Verified: guest access code 🟢
- `BookingDtoMapper.GenerateAccessCode` uses `RandomNumberGenerator.Fill` with a 32-char alphabet (excludes `I/O/1/0`) → 8 chars ≈ 40 bits of entropy. Not sequential, not guessable at 409-rate without the create rate limit.
- Codes are only generated for **guest** bookings (authenticated users get no code; owner auth is used instead).
- `AccessCode` returned in `BookingResponse` — exposed only to the booking creator (create response) and business staff (list/calendar). Reasonable.
- **Note for ops**: `my-bookings` accepts `accessCode` as a GET query parameter; it can appear in access logs. Acceptable for self-serve guest lookup but worth remembering if logs are shared. (Could move to `POST`/header later.)

### 2.5 — Rate limiting (T047) 🟢
- `POST /api/bookings` (public) → fixed window 20/min per remote IP, rejection status 429. Applies before handler work, blunting slot-enumeration and spam.
- Cancel/reschedule/my-bookings are not rate limited — acceptable because they require a valid access code or authenticated ownership (not brute-forcible at useful rates without the 40-bit code).

### 2.6 — Slot integrity 🟢
- Postgres EXCLUDE constraint `EX_bookings_StaffTime_Overlap` (btree_gist, half-open `[)` range, `Status IN (1,2)`) guarantees two active bookings for the same staff never overlap — the physical backstop. `SaveChangesAsync` maps `23P01` → `BookingConflictException` (409), `23505` → `IdempotencyConflictException` (returns existing booking).
- Manila conversion happens only at DTO boundary (`BookingDtoMapper.ToManila`).

---

## 3. Open items for human sign-off (before merge)
1. Re-read `CreateBookingCommandHandler.cs` `MatchesRequest` + race path (lines ~55–110) and confirm the 409-on-mismatch behavior is acceptable for the intended clients (idempotent retries send an identical payload, so a mismatch genuinely indicates a bug/abuse).
2. Confirm the `businessId` claim source for staff tokens at registration/accept flows — auth code (Rule 6) requires line-by-line human review; booking layer trusts the claim.
3. Decide whether `my-bookings?accessCode=` query-param exposure (2.4) is acceptable for Q2 or should move to a request body/header.

## 4. Sign-off
- [ ] Human reviewer: ____________
- [ ] Date: ____________
- [ ] Notes: ____________