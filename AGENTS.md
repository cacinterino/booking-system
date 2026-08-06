# AGENTS.md — Appointment Booking System

## Tech Stack
- **API**: ASP.NET Core 9 Web API (Clean Architecture, CQRS via MediatR)
- **Client**: React 18 + TypeScript + Vite + Tailwind CSS v4
- **Database**: PostgreSQL 16 (EF Core 9)
- **Real-time**: SignalR
- **Auth**: ASP.NET Core Identity + JWT (15min access, 7-day rotating refresh)
- **Payments**: PayMongo (GCash/Maya) for PH market
- **Testing**: xUnit, Moq, FluentAssertions, Testcontainers, Respawn, Playwright
- **CI/CD**: GitHub Actions → Render (API) + Vercel (Client)
- **AI Tooling**: OpenCode with Nemotron 3 / DeepSeek, GitHub + Postgres MCP, Impeccable design skill

## Folder Structure (4-Layer Clean Architecture)
```
booking-system/
├── Booking.Api/                    # ASP.NET Core Solution
│   ├── src/
│   │   ├── Booking.Domain/         # Entities, Enums, Domain Events, Value Objects (ZERO deps)
│   │   ├── Booking.Application/    # Commands, Queries, Handlers, DTOs, Interfaces
│   │   ├── Booking.Infrastructure/ # EF Core, Repositories, Email/SMS, Auth, SignalR
│   │   └── Booking.Api/            # Controllers, Middleware, Program.cs, SignalR Hubs
│   └── tests/
│       ├── Booking.UnitTests/
│       └── Booking.IntegrationTests/
├── booking-client/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── features/               # Feature-based modules (booking, auth, dashboard)
│   │   ├── shared/                 # UI components, hooks, utilities, API client
│   │   ├── pages/                  # Route-level components
│   │   └── main.tsx
├── docker-compose.yml
├── .github/workflows/
└── README.md
```

## Naming Conventions
- **CQRS**: `CommandName` + `CommandNameHandler` (e.g., `CreateBookingCommand`, `CreateBookingCommandHandler`)
- **Queries**: `QueryName` + `QueryNameHandler` (e.g., `GetAvailabilityQuery`, `GetAvailabilityQueryHandler`)
- **DTOs**: `record` types with `Request`/`Response` suffix (e.g., `CreateBookingRequest`, `BookingResponse`)
- **Entities**: PascalCase classes in `Booking.Domain` (no EF attributes)
- **Interfaces**: `I` prefix in Application (e.g., `IEmailService`, `IDateTimeProvider`)

## Branching Strategy (ALWAYS branch — never commit directly to main)
- `main` — **STAGING**. Merged `feat/*` / `bugfix/*` work lands here for testing.
- `feat/<name>` — feature branches, branched from `main`, merged back to `main` via PR.
- `bugfix/<name>` — fix branches, branched from `main`, merged back to `main` via PR.
- `release/<version>` — **PRODUCTION**. Cut from `main` when staging is stable; deploys to prod; hotfixes applied here and merged back to `main`.
- Rules: never commit directly to `main` or `release/*`; open a PR and merge. One feature slice per session.

## Critical Rules
1. **Always write a test for the availability engine when touching it** — this is the core algorithm
2. **Domain has ZERO dependencies** — no EF, no MediatR, no external packages
3. **All timestamps stored in UTC** — convert to `Asia/Manila` ONLY at API response boundary (DTO mapping)
4. **Prevent double-booking** — Postgres exclusion constraint on `(StaffId, StartTime)` + idempotency key on `POST /api/bookings`
5. **Small, reviewed chunks** — scaffold → generate → run tests → commit. One feature slice per session.
6. **Auth/security code** — write and review yourself line by line; treat AI output as first draft only
7. **Soft delete** — `IsDeleted` flag + global query filter on `Booking` and `Customer`

## Key Algorithms to Protect
- **Availability Engine** (Phase 4.3): Combines staff schedules, overrides, existing bookings, service duration → returns available slots per day. Must handle: no bookings, fully booked, overrides adding/removing availability, timezone edge cases near midnight.
- **Concurrency**: Two simultaneous bookings for same slot → exactly one succeeds, other gets clean 409 error (not 500).

## Environment Variables (Production)
| Variable | Render (API) | Vercel (Client) |
|----------|--------------|-----------------|
| `ConnectionStrings__DefaultConnection` | ✅ | |
| `Jwt__Key`, `Jwt__Issuer`, `Jwt__Audience` | ✅ | |
| `Email__ApiKey`, `Email__From` | ✅ | |
| `Sms__Provider`, `Sms__ApiKey`, `Sms__From` | ✅ | |
| `PayMongo__SecretKey` | ✅ | |
| `AllowedOrigins` | ✅ | |
| `VITE_API_URL` | | ✅ |

## Market-Specific (Philippines)
- **Timezone**: Hardcode `Asia/Manila` — store UTC, convert at boundary
- **Payments**: PayMongo integration for GCash/Maya deposit (reduces no-shows)
- **SMS**: Semaphore PH provider
- **Data Privacy**: RA 10173 note in README (what PII collected, why, how stored)

## MCP Servers (in opencode.json)
- **GitHub**: Day 1 — PRs, issues, CI status
- **Postgres**: Day 3 (after `docker compose up`) — inspect real schema
- **Playwright**: Week 2 — E2E tests against real browser
- **Context7**: As needed — current docs for Tailwind v4, EF Core 9, PayMongo
- **Impeccable Design Skill**: Install before Phase 4 (`npx impeccable install` → `/impeccable init`)

## Phase Execution Order (14 Days)
See `APPOINTMENT_BOOKING_PLAN.md` and `TASK_KICKOFF_PROMPTS.md` for detailed prompts per phase.