# Case Study: Booked. — Appointment Booking for Philippine Service Businesses

## Problem Statement

Small service businesses in the Philippines (clinics, salons, barbershops, spas) still rely on phone calls, walk-ins, and paper diaries to manage appointments. This leads to:

- **No-shows** — Customers forget appointments, leaving empty slots and lost revenue
- **Double-bookings** — Two customers scheduled for the same slot, causing confusion and lost trust
- **No online presence** — No way for customers to book 24/7 without calling
- **No deposits** — No financial commitment from customers, increasing no-show rates

## Solution: Booked.

Booked. is a full-stack appointment booking platform built specifically for the Philippine service market. It enables businesses to:

- Publish a public booking page (`/book/:businessSlug`) customers can share
- View real-time availability computed from staff schedules, overrides, and existing bookings
- Accept GCash/Maya deposits via PayMongo to hold slots and cut no-shows
- Send automated reminders (24h and 1h before appointments)
- Manage staff, services, and schedules from a staff dashboard

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| API | ASP.NET Core 9 Web API | Mature, performant, easy to explain in interviews |
| Client | React 18 + TypeScript + Vite | Modern, type-safe, fast build times |
| Styling | Tailwind CSS v4 | Utility-first, design system friendly |
| Database | PostgreSQL 16 + EF Core 9 | Reliable, JSONB support, great .NET integration |
| Auth | ASP.NET Core Identity + JWT | Industry standard, 15min access + 7-day refresh |
| Real-time | SignalR | Live calendar updates for staff |
| Payments | PayMongo (GCash/Maya) | Philippine market leader for digital payments |
| Testing | xUnit, Moq, FluentAssertions, Testcontainers | Industry-standard .NET testing |
| E2E | Playwright | Browser-based critical path testing |

## Architecture Decisions

### Clean Architecture with CQRS

The solution follows 4-layer Clean Architecture:

```
Booking.Domain      — Entities, value objects, domain events (ZERO dependencies)
Booking.Application — Commands, queries, handlers, validators, DTOs
Booking.Infrastructure — EF Core, repositories, email/SMS, auth, SignalR
Booking.Api — Controllers, middleware, Program.cs, SignalR Hubs
```

**Domain has zero dependencies** — no EF Core, no MediatR, no external packages. This makes the core business logic trivial to unit test and easy to explain in interviews.

### Double-Booking Prevention (Database-Level)

Two customers cannot book the same slot. This is enforced at the database level using a PostgreSQL exclusion constraint:

```sql
EXCLUDE USING gist (StaffId WITH =, tstzrange("StartTime","EndTime",'[)') WITH &&)
WHERE (Status IN (1,2))
```

The half-open `[)` range means back-to-back bookings (e.g., 10:00-10:45 and 10:45-11:30) do not conflict. Exactly one of two simultaneous booking attempts wins; the other gets a clean HTTP 409, not a 500.

### Idempotent Booking Creates

`POST /api/bookings` accepts an `Idempotency-Key` header. Retrying with the same key returns the existing booking (HTTP 200) instead of creating a duplicate.

### Timezone Strategy

All timestamps stored in UTC. Asia/Manila conversion happens only at the API response boundary (DTO mapping). This prevents the #1 source of booking bugs — wrong-day bookings due to timezone confusion.

## Challenges & Solutions

### Challenge: Double-Booking Race Condition

Two customers hitting "confirm" on the same slot simultaneously.

**Solution:** PostgreSQL exclusion constraint at the database level. Application code catches the violation and returns HTTP 409 with a clear message. Tested with concurrent booking tests — exactly one 201, one 409.

### Challenge: Timezone Edge Cases Near Midnight

Appointments spanning midnight in Asia/Manila (UTC+8).

**Solution:** All storage in UTC, conversion at boundary. Availability engine generates slots in Manila time and converts to UTC for storage. Tested with date-sensitive booking tests.

### Challenge: Empty Demo Data

A screener clicking the live demo should see data, not emptiness.

**Solution:** Seed script (`dotnet run --seed`) creates services, staff, schedules, demo bookings, and demo admin account. Anyone can clone the repo and see a populated calendar in under a minute.

## What I'd Improve

1. **PayMongo integration** — Currently deferred (deposits optional). Would add payment intent creation and webhook handling for GCash/Maya deposits.
2. **Notifications** — Email/SMS reminders via SendGrid/Resend and Semaphore PH. Currently deferred.
3. **E2E tests** — Playwright for critical paths (Book → Confirm → Cancel). Currently deferred.
4. **CI/CD** — GitHub Actions → Render + Vercel. Workflows exist but need secrets configured.
5. **Caching** — In-memory cache for availability queries. Would add `IMemoryCache` with invalidation on booking writes.

## Live Demo

- **API:** [Render deployment]
- **Client:** [Vercel deployment]
- **Repo:** https://github.com/cacinterino/booking-system

## Data Privacy (RA 10173)

Booked. collects customer personal information (name, email, phone) for appointment booking and reminders. Data is stored in PostgreSQL, access-controlled, and soft-deleted (never hard-deleted) to maintain audit trails. Customers may request access, correction, or deletion of their data.
