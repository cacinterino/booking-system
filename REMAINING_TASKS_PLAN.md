# Remaining Tasks Plan - Appointment Booking System

**Updated:** 2026-08-08  
**Status:** Phases 1-3 (Auth API + Frontend) ✅ · Phase 4 backend core ✅ (4.1/4.2/4.3) · **4.4 Booking Flow committed on `feat/4.4-booking`**  
**Important decisions** (from working session):
- **PayMongo (4.5) is SKIPPED** for now — deposits are optional (`BusinessSettings.RequireDeposit = false`) so bookings work without a payment gateway. Plan section kept for future.
- **4.4 is implemented and validated end-to-end against the Docker API** (create, idempotent retry, race → one 201 + one 409, my-bookings, cancel, reschedule, calendar, status transitions). Branch `feat/4.4-booking` is ahead of origin and NOT yet merged to `main`.

---

## ✅ COMPLETED

| Phase | Task | Status |
|-------|------|--------|
| 1 | .NET 4-layer Clean Architecture solution | ✅ |
| 1 | React + Vite + TypeScript + Tailwind v4 | ✅ |
| 1 | Docker Compose (Postgres + API on :5000 + pgAdmin :5050) | ✅ |
| 1 | GitHub repo + branch protection | ✅ |
| 2 | Domain entities + EF configs + initial migration (21 tables) | ✅ |
| 3 | Auth API (Register, Login, Me, Refresh, Revoke, Forgot/Reset) | ✅ |
| 3 | React auth (Login, Register, Profile, Dashboard, Protected Routes, AuthContext) | ✅ |
| 3 | Landing page design system (Fraunces/IBM Plex, brass/paper tokens) | ✅ |
| 4.1 | Service + ServiceCategory CRUD API, validators | ✅ |
| 4.1 | Admin Services page (`AdminServicesPage.tsx`) | ✅ |
| 4.2 | Staff CRUD, Staff-Service M2M, StaffSchedule weekly, ScheduleOverride | ✅ |
| 4.3 | **Availability Engine** (pure algorithm + Manila timezone boundary + IMemoryCache TTL) | ✅ |
| 4.3 | `/api/availability?serviceId=&date=&staffId=` endpoint | ✅ |
| Ax | Onboarding: owner registration, staff invites, accept flow, `/api/staff/me` workspace | ✅ |
| Ax | Dashboard navbar with role-based links | ✅ |
| Ax | CORS + Docker fixes (API container on :5000) | ✅ |
| 7.1 | Unit tests: **45 passing** (services, staff, business, availability engine, auth) | ✅ |
| 4.4 | **Booking Flow backend** — create (idempotent + double-booking 409), my-bookings, cancel, reschedule, list, calendar, status transitions; Manila-boundary DTO conversion; rate limiting on POST /api/bookings | ✅ |
| 7.2 | Testcontainers integration tests: **7 passing** (concurrency race, adjacent-slot regression, overlap 409, lifecycle, staff lifecycle, list/calendar/status) | ✅ |

**Current branch:** `feat/4.4-booking` (working branch; NOT merged to `main`). US1/US2/US3 + polish committed; ready for PR.

---

## 🔄 IN PROGRESS

- **Merging `feat/4.4-booking` to `main`** via PR (US1–US3 + polish committed; full suite green: 66 unit + 7 integration). T046 security review (human) still outstanding before merge.

---

## 📋 PHASE 4: CORE FEATURES — REMAINING

### 4.4 Booking Flow  ⭐ COMPLETE (backend on `feat/4.4-booking`)
- [x] `POST /api/bookings` — Create booking (guest + authenticated), from an availability slot.
- [x] **Double-booking protection**: exactly one of two simultaneous creates wins, other gets clean **409, not 500**. Postgres EXCLUDE constraint `EXCLUDE USING gist (StaffId WITH =, tstzrange("StartTime","EndTime",'[)') WITH &&) WHERE (Status IN (1,2))` (half-open `[)` so back-to-back slots do not conflict).
- [x] Idempotency key header (`Idempotency-Key`) → 200 + existing booking on retry.
- [x] `GET /api/bookings/my-bookings` — customer's bookings (guest access code).
- [x] `POST /api/bookings/{id}/cancel` — guest/owner cancel (frees the slot).
- [x] `POST /api/bookings/{id}/reschedule` — owner/guest/staff reschedule (live availability re-check).
- [x] `GET /api/bookings` — admin/staff list (filterable by status/staff/date).
- [x] `GET /api/bookings/calendar` — staff calendar view events.
- [x] `PUT /api/bookings/{id}/status` — staff confirm/complete/no-show.
- [x] Cache invalidation on booking write (IAvailabilityCache).
- [x] Bug fixes found during quickstart: exclusion range `[]`→`[)` (adjacent slots) + calendar default `from/to` when omitted (was 500).

### 4.5 PayMongo Integration — **SKIPPED** (decision: deposits optional; revisit later)
- [ ] Payment entity + EF config *(deferred)*
- [ ] PayMongo payment intent + GCash/Maya deposit *(deferred)*

---

## 📋 PHASE 6: FRONTEND FEATURES — REMAINING (depends on 4.4 backend)

- [ ] **Public booking wizard** `/book/:businessSlug` (Service → Staff → Date/Time via `/api/availability` → Confirm).
- [ ] **Customer dashboard** `/my-bookings` (upcoming/past, cancel/reschedule).
- [ ] **Staff dashboard** calendar view + today's bookings.
- [ ] **Admin** staff + schedules CRUD screens (services page already done).
- [ ] Business registration / accept-invitation screens (backend + API done; UI pending).
- [ ] Responsive polish, loading skeletons, error states.

---

## SKIPPED / DEFERRED (recorded for future, NOT blocking)

| Phase | Task |
|-------|------|
| 4.5 | PayMongo payments (deposits optional instead) |
| 5 | Notifications (Email/SMS/SignalR), background reminders |
| 7.2 | Integration tests (Testcontainers/Respawn) |
| 7.3 | E2E Playwright |
| 8 | CI/CD + production deploy (Render/Vercel) |
| 9 | README, Scalar docs, RA 10173 note, portfolio case study |

---

## ⭐ PRIORITIZED NEXT STEPS (given limited time)

1. **T046 security review (HUMAN)** — owner checks, guest accessCode handling, role policies on all booking endpoints. Must be documented before the `feat/4.4-booking` PR merges.
2. **Merge `feat/4.4-booking` to `main`** via PR (staging), then validate staging. Never commit to `main` directly.
3. **Frontend**: public booking wizard + my-bookings + staff calendar — ties the backend into a demo-able app.
4. Only then: notifications, deployment, polish (deferred).

---

## 🚧 DEFERRED POST-PHASE-6 (recorded, NOT blocking)

| Phase | Task |
|-------|------|
| 4.4 | Public confirmation link `GET /api/bookings/{id}/confirm/{token}` — depends on email delivery (Phase 5); in-app/staff confirmation is the current confirmation path. Move to Notifications when email lands. |
| 5 | Notifications (Email/SMS/SignalR), background reminders, confirmation email with access code |

---

## 📦 COMMANDS TO RUN (Windows PowerShell — run from repo ROOT, there is no `booking-system` subdir)

```bash
cd C:\Users\Carl\OneDrive\Desktop\Projects\Appointment booking

# Docker stack (API on localhost:5000, Postgres 5432, pgAdmin 5050)
docker compose up -d
docker compose build api
docker compose up -d api

# Migrations against Docker Postgres
dotnet ef database update --project src/Booking.Infrastructure --startup-project src/Booking.Api

# Run tests
dotnet test Booking.sln

# Commit + push (feature branch — never commit to main/release)
git add . && git commit -m "feat: ..." && git push

# API in terminal, client in another
dotnet run --project src/Booking.Api      # (or the docker api container :5000)
cd booking-client && npm run dev          # http://localhost:5173
```