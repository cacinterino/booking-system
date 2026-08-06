# Remaining Tasks Plan - Appointment Booking System

**Generated:** 2026-08-06  
**Status:** Phases 1-3 (Auth API + Frontend Auth) ✅ Complete  
**Next:** Phase 3 Frontend Polish → Phase 4 Core Features

---

## ✅ COMPLETED

| Phase | Task | Status |
|-------|------|--------|
| 1 | .NET Solution (4-layer Clean Architecture) | ✅ |
| 1 | React + Vite + TypeScript + Tailwind | ✅ |
| 1 | Docker Compose (Postgres + API + Client) | ✅ |
| 1 | GitHub repo + branch protection | ✅ |
| 2 | Domain Entities (10 entities) | ✅ |
| 2 | EF Core Configurations + Migration | ✅ |
| 2 | PostgreSQL database (21 tables) | ✅ |
| 3 | Auth Application Layer (DTOs, Commands, Queries, Validators, Handlers) | ✅ |
| 3 | Auth Infrastructure (JWT, Identity, Email, DI) | ✅ |
| 3 | Auth API (Register, Login, Me, Refresh, Revoke, Forgot/Reset Password) | ✅ |
| 3 | React Auth Frontend (Login, Register, Profile, Dashboard, Protected Routes) | ✅ |
| 3 | Design System (Fonts, Tailwind Config from project-showcase.html) | 🔄 In Progress |

---

## 🔄 IN PROGRESS

### Phase 3: Frontend Auth Polish
- [ ] Fix remaining TypeScript warnings (ProfilePage `reset` unused)
- [ ] Apply design system to LandingPage (use design tokens)
- [ ] Apply design system to LoginPage
- [ ] Apply design system to RegisterPage  
- [ ] Apply design system to ProfilePage
- [ ] Apply design system to DashboardPage
- [ ] Test full auth flow in browser (Register → Login → Dashboard → Profile → Logout)

---

## 📋 PHASE 4: CORE FEATURES (Week 1-2)

### 4.1 Services Management (Admin/Staff)
- [ ] ServiceCategory CRUD API + Frontend
- [ ] Service CRUD API + Frontend
- [ ] Service-ServiceCategory relationship
- [ ] Admin Service List/Create/Edit/Delete pages

### 4.2 Staff & Schedules
- [ ] Staff CRUD API + Frontend
- [ ] Staff-Service many-to-many
- [ ] StaffSchedule (weekly recurring) CRUD
- [ ] ScheduleOverride (date-specific) CRUD
- [ ] Staff Calendar API endpoint

### 4.3 Availability Engine (CORE ALGORITHM ⚠️)
- [ ] **Algorithm**: Combine staff schedules + overrides + existing bookings + service duration
- [ ] **Edge cases**: No bookings, fully booked, overrides adding/removing availability, timezone edge cases near midnight
- [ ] **Concurrency test**: Two simultaneous bookings for same slot → exactly one succeeds, other gets 409
- [ ] **Caching**: IMemoryCache with TTL + invalidation on booking write
- [ ] Unit tests (no bookings, fully booked, override removes, override adds)
- [ ] Integration test for double-booking prevention

### 4.4 Booking Flow
- [ ] `GET /api/availability?serviceId=&date=&staffId=` - Public availability
- [ ] `POST /api/bookings` - Create booking (guest + authenticated)
- [ ] Idempotency key header on booking creation
- [ ] `GET /api/bookings/my-bookings` - Customer bookings
- [ ] `POST /api/bookings/{id}/cancel` - Customer cancel (soft delete)
- [ ] `POST /api/bookings/{id}/reschedule` - Customer reschedule
- [ ] `GET /api/bookings` - Admin/Staff list (filterable)
- [ ] `GET /api/bookings/calendar` - Staff calendar view
- [ ] `PUT /api/bookings/{id}/status` - Staff confirm/complete/no-show
- [ ] `POST /api/bookings/{id}/reschedule` - Staff-initiated

### 4.5 PayMongo Integration
- [ ] Payment entity + EF config
- [ ] `POST /api/bookings/{id}/payment-intent` - Create PayMongo payment intent
- [ ] Webhook handler for PayMongo callbacks
- [ ] GCash/Maya deposit flow in booking wizard

---

## 📋 PHASE 5: NOTIFICATIONS & POLISH (Week 2)

### 5.1 Email (SendGrid/Resend)
- [ ] Booking confirmation
- [ ] 24hr reminder
- [ ] 1hr reminder
- [ ] Cancellation notice
- [ ] Staff assignment notification

### 5.2 SMS (Semaphore PH)
- [ ] Same triggers as email
- [ ] Template: "Hi {Name}, your {Service} appointment is on {Date} at {Time}. Reply STOP to opt out."

### 5.3 SignalR Real-time
- [ ] `BookingHub` - Real-time calendar updates for staff/admin
- [ ] `NotificationHub` - Toast notifications for customers
- [ ] Groups: `business-{businessId}`, `staff-{staffId}`, `customer-{customerId}`

### 5.4 Background Jobs
- [ ] Reminder job (24hr / 1hr) - Hangfire or BackgroundService
- [ ] Idempotent reminder sending (don't send twice)

### 5.5 Polish
- [ ] Rate limiting on `/api/auth/login` and `POST /api/bookings`
- [ ] Soft delete on Booking/Customer (already in EF config)
- [ ] Seed script for demo data (`dotnet run --seed`)
- [ ] Responsive UI pass + loading skeletons + error states

---

## 📋 PHASE 6: FRONTEND FEATURES (Week 2-3)

### 6.1 Public Booking Wizard (`/book/:businessSlug`)
- [ ] Step 1: Service selection
- [ ] Step 2: Staff selection
- [ ] Step 3: Date/Time from availability API
- [ ] Step 4: Confirmation + Payment (GCash/Maya)

### 6.2 Customer Dashboard
- [ ] `/my-bookings` - Upcoming + Past bookings
- [ ] Cancel/Reschedule actions with optimistic updates

### 6.3 Staff Dashboard
- [ ] Calendar view (week/day toggle)
- [ ] SignalR live updates for new bookings
- [ ] Today's bookings list

### 6.4 Admin Dashboard
- [ ] Services CRUD
- [ ] Staff + Schedules CRUD
- [ ] Business Settings

### 6.5 Responsive Polish
- [ ] 375px viewport audit
- [ ] Loading skeletons (not spinners)
- [ ] Error states with retry for all TanStack Query calls

---

## 📋 PHASE 7: TESTING (Week 2-3)

### 7.1 Unit Tests (Booking.UnitTests)
- [ ] Availability engine (core algorithm)
- [ ] Booking status transitions
- [ ] Auth handlers
- [ ] Validators
- [ ] Target: >80% coverage on Domain/Application

### 7.2 Integration Tests (Booking.IntegrationTests)
- [ ] Testcontainers PostgreSQL per test class
- [ ] Respawn for DB reset
- [ ] Auth flow
- [ ] CRUD endpoints
- [ ] Booking logic
- [ ] Authorization policies

### 7.3 E2E Tests (Playwright - Optional)
- [ ] Book → Confirm → Cancel flow
- [ ] Run in CI on PR

---

## 📋 PHASE 8: CI/CD & DEPLOYMENT (Week 3)

### 8.1 GitHub Actions
- [ ] `.github/workflows/ci.yml` - Build + Test (Postgres service container)
- [ ] `.github/workflows/cd-api.yml` - Deploy API to Render/Fly.io
- [ ] `.github/workflows/cd-client.yml` - Deploy Client to Vercel

### 8.2 Production Deploy
- [ ] Provision Postgres (Neon/Supabase)
- [ ] Deploy API (Fly.io/Railway/Render paid tier - avoid free tier cold starts)
- [ ] Deploy Client to Vercel
- [ ] Configure environment variables
- [ ] Run migrations against production DB

---

## 📋 PHASE 9: DOCUMENTATION & PORTFOLIO (Week 3)

- [ ] README.md (Architecture diagram, Local setup, Env vars, API docs link, Deployment guide, Screenshots)
- [ ] API Documentation (Scalar UI at `/openapi/v1.json`)
- [ ] RA 10173 / Data Privacy Act note in README
- [ ] Portfolio Case Study (Problem, Stack, Architecture, Challenges, What's Next, Live Demo + GitHub links)
- [ ] Demo GIF/Video (60-90s: Landing → Booking Wizard → Staff Calendar SignalR → Admin)

---

## 🎯 IMMEDIATE NEXT STEPS (This Session)

1. **Apply design system to LandingPage** - Use Fraunces/IBM Plex fonts, brass/paper colors, ticket stub component
2. **Apply design system to Login/Register/Profile/Dashboard pages**
3. **Test full auth flow in browser**
4. **Commit & push frontend auth**

---

## 📦 COMMANDS TO RUN

```bash
# Test auth flow
cd booking-client && npm run dev        # http://localhost:5173
# In another terminal:
dotnet run --project src/Booking.Api   # http://localhost:5018

# Build check
dotnet build Booking.sln

# Commit frontend auth
git add . && git commit -m "feat: React auth pages + design system tokens" && git push
```

---

## 🎨 DESIGN SYSTEM REFERENCE (from project-showcase.html)

```css
/* Colors */
--ink: #14213D;
--ink-soft: #233258;
--paper: #F5F0E4;
--paper-white: #FFFDF8;
--brass: #B8862B;
--brass-soft: #D8AE5F;
--sage: #4F7860;
--slate: #5B6270;
--line: rgba(20,33,61,0.14);

/* Fonts */
font-family: 'Fraunces', serif;        /* display */
font-family: 'IBM Plex Sans', sans-serif;  /* body */
font-family: 'IBM Plex Mono', monospace;   /* mono */

/* Key Components */
.ticket          /* rotated card with brass stamp */
.stack-strip     /* 4-column metric strip */
.arch            /* 4-layer architecture diagram */
.roadmap         /* phased timeline */
.ai-grid         /* 3-column feature cards */
```

---

**Next Action:** Apply design tokens to `LandingPage.tsx` → test in browser → iterate.