# Quickstart: Public Booking Wizard

**Branch**: `feat/6.1-booking-wizard` | **Date**: 2026-08-15 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Runnable validation scenarios proving the public discovery API (this slice) works end-to-end. The wizard UI is the following slice; these scenarios validate the backend the UI consumes. Reuses the Docker stack described in `REMAINING_TASKS_PLAN.md`.

## Prerequisites

- Docker stack up: `docker compose up -d` (API on :5000, Postgres).
- A business with a known slug, active services, staff, and published schedules. To create one, follow the existing onboarding flow (owner register → business → staff invite/accept → services → schedules), or reuse the 4.4 quickstart dataset if present.

## 1. Resolve a business by slug

```bash
# PowerShell (adjust slug to your dataset, e.g. "the-hair-room")
$slug = "the-hair-room"
Invoke-RestMethod -Uri "http://localhost:5000/api/public/businesses/$slug"
```

**Expected**: 200 with `name`, `slug`, `timezone=Asia/Manila`, `requireDeposit`, `depositAmount`, `currency`, `advanceBookingDays`, `slotIntervalMinutes`.

**Negative**: `Invoke-RestMethod -Uri "http://localhost:5000/api/public/businesses/does-not-exist" -ErrorAction Stop` → 404 Problem Details (`Business not found`).

## 2. List public services

```bash
Invoke-RestMethod -Uri "http://localhost:5000/api/public/businesses/$slug/services"
```

**Expected**: 200 array of active services (name, price, durationMinutes, categoryName). No inactive services present.

## 3. List public staff (PII stripped)

```bash
Invoke-RestMethod -Uri "http://localhost:5000/api/public/businesses/$slug/staff"
```

**Expected**: 200 array; each item has `fullName` + `serviceIds` only. **Assert no `email`, `phone`, or `avatarUrl` property is present** (RA 10173).

## 4. Query availability

```bash
$serviceId = "<from step 2>"
$date = (Get-Date).Date.AddDays(1).ToString("yyyy-MM-dd")
Invoke-RestMethod -Uri "http://localhost:5000/api/public/businesses/$slug/availability?serviceId=$serviceId&date=$date"
```

**Expected**: 200 `AvailabilityResponse`; `slots[]` each have `staffName`, Manila `start`/`end`, and UTC `startUtc`/`endUtc` (8h apart). For a date with no availability, expect an empty `slots` array (200, not an error).

**Negative**: unknown `serviceId` → 404.

## 5. End-to-end: book the returned slot (reuses existing public write API)

```bash
$slot = (Invoke-RestMethod -Uri "http://localhost:5000/api/public/businesses/$slug/availability?serviceId=$serviceId&date=$date").slots[0]
$body = @{
  businessId = "<businessId from step 1>"
  serviceId  = $serviceId
  staffId    = $slot.staffId
  startTime  = $slot.startUtc          # UTC ISO with Z — never a Manila string
  notes      = "quickstart"
  guestContact = @{ name = "QA Guest"; email = "qa@example.com"; phone = "09171234567" }
} | ConvertTo-Json -Depth 4
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/bookings" -Headers @{ "Idempotency-Key" = [guid]::NewGuid().ToString() } -ContentType "application/json" -Body $body
```

**Expected**: 201 with `BookingResponse` (contains `accessCode` for guest booking, `startTime` in Manila).

## 6. Confirm + look up with access code

```bash
$code = "<accessCode from step 5>"
Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/my-bookings?accessCode=$code"
```

**Expected**: 200 array containing the just-created booking.

## Race check (zero double-booking still holds)

Run step 5 twice in parallel with the same slot but different Idempotency-Keys → exactly one 201 and one 409 (`slot is no longer available`), never a 500. Covered by existing integration tests; this is a manual smoke.

## How to run the automated tests

```bash
# from repo root
dotnet test Booking.sln
```

Includes the new unit tests for `GetPublicBusinessQueryHandler` and the public staff mapper.
