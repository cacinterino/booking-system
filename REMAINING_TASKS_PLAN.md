# Remaining Tasks Plan - Appointment Booking System

**Updated:** 2026-08-07  
**Status:** Phases 1-3 (Auth API + Frontend) ✅ · Phase 4 backend core ✅ (4.1/4.2/4.3) · **Next:** 4.4 Booking Flow  
**Important decisions** (from working session):
- **PayMongo (4.5) is SKIPPED** for now — deposits are optional (`BusinessSettings.RequireDeposit = false`) so bookings work without a payment gateway. Plan section kept for future.
- Only **1 commit is not pushed** (`feat/4.1-services` is **2 commits ahead** of origin: 4.3 + navbar were committed locally, push is pending).

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

**Current branch:** `feat/4.1-services` (working branch; NOT merged to `main`). Repo is **clean** except un-pushed commits.

---

## 🔄 IN PROGRESS

- **Pushing pending commits** — `feat/4.1-services` is 2 commits ahead of origin (4.3 Availability Engine + dashboard navbar). Push is low-risk but PR #8 already covers 4.1; assess whether to keep stacking on this branch or cut `feat/4.4-booking`.

---

## 📋 PHASE 4: CORE FEATURES — REMAINING

### 4.4 Booking Flow  ⭐ HIGHEST PRIORITY (the app's core value)
- [ ] `POST /api/bookings` — Create booking (guest + authenticated), from an availability slot.
- [ ] **Double-booking protection**: exactly one of two simultaneous creates wins, other gets clean **409, not 500**.
       Option A: postgres EXCLUDE constraint `EXCLUDE USING gist (StaffId WITH =, tsrange("StartTime","EndTime") WITH &&)` + `CREATE EXTENSION btree_gist` (needs a raw-SQL EF migration).
       Option B (lighter, shippable now): unique index + application-level reservation check in a single transaction with serializable isolation.
- [ ] Idempotency key header (`Idempotency-Key`) → reuse existing unique index `IX_bookings_IdempotencyKey`. ✍️ *already in schema*.
- [ ] `GET /api/bookings/my-bookings` — customer's bookings.
- [ ] `POST /api/bookings/{id}/cancel` — customer cancel (soft delete / status=Cancelled).
- [ ] `POST /api/bookings/{id}/reschedule` — customer reschedule (needs availability re-check).
- [ ] `GET /api/bookings` — admin/staff list (filterable by status/staff/date).
- [ ] `GET /api/bookings/calendar` — staff calendar view events.
- [ ] `PUT /api/bookings/{id}/status` — staff confirm/complete/no-show.
- Test availability invalidation on booking write (IMemoryCache).

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

1. **Push `feat/4.1-services`** (02 commits ahead) OR cut `feat/4.4-booking` to keep PRs clean — decide based on whether #8 is merged.
2. **Build 4.4 Booking Flow backend** — create/cancel/reschedule/status/calendar + idempotency + **double-booking 409 test**. This is the one feature that makes the app real.
3. **Wire `/api/availability` into booking creation** (validate chosen slot against live engine before persist).
4. **Frontend**: public booking wizard + my-bookings — ties backend into something demo-able.
5. Only then: notifications, deployment, polish (deferred).

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