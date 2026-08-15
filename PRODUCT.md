# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 18 + TypeScript + Vite + Tailwind CSS v4 client; ASP.NET Core 9 Web API (Clean Architecture, CQRS via MediatR); PostgreSQL 16 (EF Core 9); SignalR; ASP.NET Core Identity + JWT; PayMongo (deferred). Docker Compose for local Postgres + API.

## Users

Primary users are **business owners and staff** at small clinics, salons, barbershops, and spas in the Philippines: they set up services, staff schedules, and bookings, and confirm/manage appointments day-to-day.

Secondary users are **end customers** (usually guests) who book an appointment through a public link and manage their own bookings with an access code.

## Product Purpose

Booked. is an appointment booking platform for small service businesses in the Philippines. It replaces phone calls, walk-ins, and manual diaries with real-time availability and online booking, and reduces no-shows. Success means a business's customers can find an open slot and book it in seconds, while the business reliably fills and manages its day.

## Positioning

Real-time, conflict-free booking for Philippine service businesses: two people cannot book the same slot (enforced by a database exclusion constraint, exactly one winner, clean 409 for the loser), half-open time ranges so back-to-back bookings coexist, and optional GCash/Maya deposits to cut no-shows. Market-specific: Asia/Manila timezone, Semaphore SMS, RA 10173 awareness.

## Operating Context

- Owner registers a business, invites staff, defines services and per-staff weekly schedules (with schedule overrides).
- Customers book via a public wizard from an availability engine that combines schedules, overrides, existing bookings, and service duration.
- Bookings are created idempotently (guest + authenticated customers), cancelled, rescheduled, and moved through statuses (confirmed → completed / no-show / cancelled).
- Staff see a calendar of today's bookings; owners manage services and staff.
- All timestamps stored UTC, converted to Asia/Manila only at the API response boundary.

## Capabilities and Constraints

- Confirmed API: services + categories, staff + schedules + overrides, availability endpoint, booking create/my-bookings/cancel/reschedule/list/calendar/status, auth (register, login, refresh, revoke, forgot/reset), onboarding (owner registration, staff invites + accept, `/api/staff/me`).
- Confirmed client: landing page, login/register/profile, dashboard navbar with role-based links, admin services page.
- Concurrency: exactly one of two simultaneous bookings for a slot wins; the other gets a clean 409. Postgres exclusion constraint on `(StaffId, StartTime)` + idempotency key on `POST /api/bookings`.
- Soft delete (`IsDeleted` + global query filter) on Booking and Customer.
- **Deferred / not yet built:** PayMongo payments (deposits optional via `BusinessSettings.RequireDeposit = false`), notifications (email/SMS/SignalR), public booking wizard, customer dashboard, staff calendar, admin staff/schedules screens, CI/CD deploy, Playwright E2E, README/portfolio case study.
- Timezone is hardcoded to Asia/Manila.
- No customer-facing booking UI exists yet — Phase 6 (frontend features) is the next major work.

## Brand Commitments

- Product name: **Booked.** (with trailing period). Wordmark renders "Booked" with a brass-colored period.
- Voice (from landing copy): warm, confident, partner-oriented; positioned as new and looking for early partners.
- Positioned for clinics, salons, barbershops, and spas in the Philippines; GCash & Maya powered.

## Evidence on Hand

- `booking-client/src/pages/LandingPage.tsx` — full marketing copy, testimonials, pricing section ("Free forever for small teams"), feature list.
- `booking-client/src/style.css` — design tokens: ink `#14213D`, paper `#F5F0E4`, paper-white `#FFFDF8`, brass `#B8862B`, brass-soft `#D8AE5F`, sage `#4F7860`, slate `#5B6270`; Fraunces (display) + IBM Plex Sans/Mono.
- `APPOINTMENT_BOOKING_PLAN.md`, `REMAINING_TASKS_PLAN.md`, `TASK_KICKOFF_PROMPTS.md`, `TRELLO_BOARD_PLAN.md`, `specs/001-booking-flow/` — full plan, spec, data model, contracts, security review.
- `docs/` — spec-kit documentation.
- No real customer data, testimonials, or production deployments exist; landing-page testimonials are placeholder copy and must not be treated as real evidence.

## Product Principles

1. **Correctness over speed of delivery** — double-booking protection and clean conflict handling are non-negotiable; the database is the final authority on slot conflicts.
2. **Market-first specificity** — every decision (timezone, payments, SMS, data-privacy note) serves the Philippine small-business customer.
3. **Real-time trust** — availability must reflect the truth of schedules, overrides, and existing bookings at the moment of booking.
4. **Owner & staff productivity first** — the dashboard is for running a day, not just configuring it; the guest wizard stays simple.
5. **Clean architecture, demonstrable quality** — a portfolio project where tests, security review, and disciplined branching are part of the deliverable.

## Accessibility & Inclusion

- Client uses semantic elements and prefers-reduced-motion support in the landing design. No product-specific accessibility standard was confirmed beyond this.
