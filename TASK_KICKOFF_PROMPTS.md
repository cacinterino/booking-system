# Task Kickoff Prompts

One ready-to-paste prompt per Trello card, in the same order as `TRELLO_BOARD_PLAN.md`. Paste
these straight into OpenCode. Each one assumes `AGENTS.md` is already in the repo root — the
prompts intentionally don't re-explain stack/conventions, since AGENTS.md already covers that.

**How to use these:** copy one prompt per session, let the agent finish it, review the diff,
run tests, commit, then move the Trello card to the next list before starting the next prompt.
Don't chain multiple cards into one session — that's the #1 way agentic sessions drift off track.

---

## Phase 0 – AI Setup

**Install Claude Code / set up dev environment** *(adjust: OpenCode)*
```
Confirm OpenCode can reach my local Nemotron/DeepSeek endpoint. Run a trivial no-tool prompt
first ("say ready"), then a tool-calling test using the filesystem tool to list the repo root.
Report whether tool calls came back well-formed.
```

**Write AGENTS.md with stack, structure, conventions**
```
Read PLAN_REVIEW_AND_IMPROVEMENTS.md and the original project plan in this repo. Write an
AGENTS.md at the repo root covering: tech stack (ASP.NET Core 9 + React 18/Vite/TS), the
4-layer Clean Architecture folder structure, CQRS/MediatR naming conventions (CommandName +
CommandNameHandler), DTO naming (record types, `Request`/`Response` suffix), and the rule
"always write a test for the availability engine when touching it." Keep it under 150 lines —
this gets read every session, so terseness matters more than completeness.
```

**Connect GitHub MCP**
```
Add a GitHub MCP server entry to opencode.json (local, via npx @modelcontextprotocol/server-github).
Use my GITHUB_TOKEN env var, don't hardcode it. After adding it, test it by listing open issues
on this repo (empty is fine if there are none yet — just confirm the call succeeds).
```

**Connect Postgres MCP (after docker compose up)**
```
docker compose up -d postgres, confirm it's healthy, then add a Postgres MCP server entry to
opencode.json pointing at the local connection string. Test it with a query that lists tables
(empty is fine before migrations run).
```

---

## Phase 1 – Foundation

**Create GitHub repo + branch protection on main**
```
Run the commands to init git, create a private GitHub repo named booking-system via gh cli, and
push the initial commit. Then set branch protection on main requiring at least one PR review
before merge. Confirm the protection rule is live.
```

**Scaffold .NET solution (Domain/Application/Infrastructure/Api + tests)**
```
Scaffold the Booking solution exactly as laid out in the plan's architecture section: 4 class
library projects (Domain, Application, Infrastructure, Api) with correct project references
(Domain has none; Application references Domain; Infrastructure references Application+Domain;
Api references all three), plus Booking.UnitTests and Booking.IntegrationTests. Verify
`dotnet build` succeeds with zero warnings before finishing.
```

**Install core NuGet packages**
```
Install the NuGet packages listed in the plan's Phase 1.2 into the correct projects (EF Core +
Npgsql + Identity + JWT + MediatR + FluentValidation + Mapster + Serilog + SignalR into
Infrastructure; OpenApi/Scalar/HealthChecks into Api; Moq/FluentAssertions into UnitTests;
Mvc.Testing/Testcontainers/Respawn into IntegrationTests). Run `dotnet restore` and confirm no
version conflicts.
```

**Scaffold React client (Vite + TS + Tailwind v4)**
```
Scaffold booking-client with Vite's react-ts template, then install the dependencies listed in
the plan's Phase 1.3 (TanStack Query, react-router-dom, zod, react-hook-form, axios, signalr,
date-fns, lucide-react) plus Tailwind v4 as a dev dependency configured via the Vite plugin
(not the old PostCSS config). Confirm `npm run dev` serves a blank page with Tailwind styles
applying correctly (test with a utility class on the root div).
```

**Add docker-compose.yml (Postgres + API + client)**
```
Write docker-compose.yml exactly as specified in the plan's Phase 1.5, including the healthcheck
on Postgres and the API's dependency on Postgres being healthy (not just started). Add a
Dockerfile for the API and a Dockerfile.dev for the client if they don't exist yet.
```

**Verify docker compose up end to end**
```
Run docker compose up and confirm: Postgres is healthy, the API responds on localhost:5000
(even just a default 404/health route), and the client dev server serves on localhost:5173.
Fix whatever's broken and report what you changed.
```

---

## Phase 2 – Data & Auth

**Define Domain entities**
```
In Booking.Domain, create the entities listed in the plan's Phase 2.1 plus the Payment entity
from the review notes (BookingId, Provider, Status, Amount, ProviderRef). Use records or classes
per typical DDD conventions for this stack, keep entities free of any EF Core or persistence
attributes — Domain has zero dependencies. Add BookingStatus as an enum (Pending, Confirmed,
Cancelled, Completed, NoShow).
```

**Configure EF Core + write initial migration**
```
In Booking.Infrastructure, create BookingDbContext with DbSets for all Domain entities, and
IEntityTypeConfiguration<T> classes for each using PostgreSQL-appropriate types (UUID primary
keys, JSONB for BusinessSettings). Generate the InitialCreate migration and confirm it applies
cleanly against the local docker Postgres.
```

**Add unique/exclusion constraint to prevent double-booking**
```
Add a Postgres exclusion constraint (or unique constraint on StaffId+StartTime as a simpler
alternative) to the Booking table's EF configuration so two confirmed bookings can never overlap
for the same staff member. Write an integration test that attempts to create two overlapping
bookings concurrently and asserts the second one fails cleanly with a meaningful error, not a
raw DB exception leaking to the caller.
```

**Implement ApplicationUser + Identity roles**
```
Extend IdentityUser to ApplicationUser with BusinessId, FullName, PhoneNumber. Configure three
roles: Admin, Staff, Customer. Wire Identity into BookingDbContext and confirm the migration
that adds Identity tables applies cleanly.
```

**Implement JWT auth endpoints**
```
Implement the auth endpoints from the plan's Phase 3.2 (register, login, refresh, revoke, me,
forgot-password, reset-password) using MediatR commands/queries per the CQRS convention in
AGENTS.md. Access tokens expire in 15 minutes, refresh tokens in 7 days and rotate on use. Write
unit tests for the handlers, mocking the user manager.
```

**Write unit tests for auth logic**
```
Add unit tests covering: successful login, login with wrong password, refresh token rotation,
refresh with an already-used (revoked) token, and role-based authorization on a sample protected
endpoint. Use Moq + FluentAssertions per AGENTS.md conventions.
```

**Decide + hardcode Asia/Manila timezone handling**
```
Add a IDateTimeProvider abstraction in Application, implemented in Infrastructure, that always
returns UTC. Document in AGENTS.md and in a short code comment on the availability engine entry
point that all storage is UTC and all conversion to Asia/Manila happens only at the API response
boundary (DTO mapping), never inside domain logic. Add a unit test asserting a booking made near
midnight Manila time lands on the correct UTC date.
```

---

## Phase 3 – Core Features

**Services CRUD endpoints**
```
Implement the Services CRUD endpoints from the plan's Phase 4.1 as MediatR commands/queries with
FluentValidation validators. Paginate the list endpoint. Restrict write access to Admin role.
Write integration tests for create, update, delete, and unauthorized access.
```

**Staff CRUD + weekly schedule + date overrides**
```
Implement Staff CRUD, weekly StaffSchedule, and ScheduleOverride endpoints per the plan's Phase
4.2. A schedule override should be able to represent both time-off and extra hours on a specific
date. Write integration tests covering a normal week, a day with an override, and a full day off.
```

**Availability engine (core algorithm)**
```
Implement the availability engine per the plan's Phase 4.3 algorithm: given BusinessId,
ServiceId, optional StaffId, and a date range, return available time slots per day by combining
staff schedules, overrides, existing bookings, and service duration. This is the piece of logic
I need to be able to explain in an interview without notes — write it clearly, with comments
explaining the exclusion logic, not just working code. Include a unit test suite covering: no
bookings, fully booked day, a day with an override removing availability, and a day with an
override adding availability.
```

**Availability engine: concurrency/double-booking test**
```
Write an integration test that simulates two concurrent booking requests for the exact same
staff+slot (use Task.WhenAll against two separate DbContext instances) and asserts exactly one
succeeds and the other fails with a clean, specific error — not a generic 500.
```

**Availability engine: in-memory caching**
```
Add IMemoryCache caching to the availability query, keyed by BusinessId+StaffId+date, with a
short TTL (e.g. 30 seconds) and explicit invalidation on booking create/cancel/reschedule. Write
a unit test confirming the cache is invalidated correctly after a booking write.
```

**Booking creation flow (guest + authenticated)**
```
Implement POST /api/bookings supporting both guest bookings (email+phone, no account) and
authenticated customer bookings, per the plan's Phase 4.4. Require an idempotency key header and
store it to prevent duplicate submissions from a double-click or retry. Write integration tests
for both guest and authenticated paths.
```

**Booking cancel/reschedule endpoints**
```
Implement the customer-initiated cancel and reschedule endpoints from the plan's Phase 4.4.
Cancelling should soft-delete-mark the booking (not hard delete) so it stays in the audit trail.
Rescheduling should re-run the availability/conflict check against the new slot. Write
integration tests for both.
```

**Admin/staff booking list + calendar view endpoint**
```
Implement GET /api/bookings (filterable by date/status/staff) and GET /api/bookings/calendar for
the staff dashboard, per the plan's Phase 4.4. Restrict to Staff/Admin roles, scoped to their
own BusinessId. Write an integration test confirming a staff member from Business A cannot see
Business B's bookings.
```

**PayMongo integration: payment intent + webhook handler**
```
Add a Payment entity-backed flow: POST /api/bookings/{id}/payment-intent creates a PayMongo
payment intent for a fixed deposit amount and returns the client-side details needed to complete
GCash/Maya payment. Add a webhook endpoint that verifies PayMongo's signature and updates the
Payment/Booking status on success or failure. Use a sandbox/test API key — do not hardcode real
credentials, read from configuration. Write a unit test for the webhook handler using a sample
payload.
```

---

## Phase 4 – Frontend

**Axios instance + TanStack Query setup**
```
Set up shared/api/axios.ts with the base API URL from env, an auth token interceptor, and a
401-triggers-refresh-then-retry interceptor. Set up shared/api/queryClient.ts exactly per the
plan's Phase 6.3 config (5 min staleTime, retry 1, no refetch on window focus).
```

**Auth pages: login, register, profile**
```
Build the login, register, and profile pages under features/auth using react-hook-form + zod for
validation, calling the auth endpoints via TanStack Query mutations. Keep components under
shared/components (Button, Input, etc.) reusable — this is the first feature built, so the
component patterns set here will get reused everywhere else.
```

**Public booking wizard: service -> staff -> date/time -> confirm**
```
Build the public booking wizard at /book/:businessSlug as a 4-step flow (service selection,
staff selection, date/time from the availability endpoint, confirmation) under
features/booking/PublicBookingWizard. Each step should be its own component with the wizard
state lifted to a parent. Handle the guest-vs-authenticated case per the API.
```

**Payment step in booking wizard (GCash/Maya via PayMongo)**
```
Add a payment step to the booking wizard after slot confirmation, calling the
payment-intent endpoint and handling PayMongo's redirect/completion flow for GCash/Maya. Show a
clear pending/confirmed state and handle the failure case with a retry option, not a dead end.
```

**Customer "My Bookings" page**
```
Build /my-bookings showing the authenticated customer's upcoming and past bookings, with cancel
and reschedule actions wired to the corresponding endpoints. Use optimistic updates via TanStack
Query for cancel, with rollback on failure.
```

**Staff calendar view (week/day) with SignalR live updates**
```
Build the staff dashboard calendar (week/day toggle) under features/dashboard/StaffCalendar,
pulling from the calendar endpoint and subscribing to BookingHub via @microsoft/signalr scoped
to the business-{businessId} group so new bookings appear live without a manual refresh.
```

**Admin settings pages (services, staff, business)**
```
Build the admin CRUD pages for services, staff (+ schedules), and business settings under
features/dashboard, reusing the shared table/form components built earlier. Restrict routing to
the Admin role client-side (in addition to the server-side check that already exists).
```

**Responsive pass + loading/error states**
```
Audit every page built so far down to a 375px viewport. Add loading skeletons (not spinners
alone) and explicit error states with a retry action for every TanStack Query call that doesn't
already have one. Fix any layout breakage found.
```

---

## Phase 5 – Notifications & Polish

**Email service integration (SendGrid/Resend)**
```
Implement IEmailService in Infrastructure using SendGrid or Resend (pick one, note the choice in
AGENTS.md), covering the templates listed in the plan's Phase 5.1: booking confirmation, 24hr
reminder, 1hr reminder, cancellation notice, staff assignment notification. Use a test/sandbox
API key from configuration.
```

**SMS integration (Semaphore PH)**
```
Implement ISmsService using Semaphore, sending the same trigger set as email using the template
in the plan's Phase 5.2. Read the API key from configuration, not hardcoded.
```

**Booking reminder job (24hr / 1hr)**
```
Add a background job (Hangfire or a simple hosted BackgroundService, pick one and note why in
AGENTS.md) that scans for upcoming confirmed bookings and triggers the 24hr and 1hr reminder
notifications exactly once per booking. Write a test confirming a reminder isn't sent twice if
the job runs more than once in the window.
```

**Rate limit login + booking endpoints**
```
Add ASP.NET Core's built-in rate limiting middleware to /api/auth/login (prevent brute force) and
POST /api/bookings (prevent booking spam), with sensible limits noted in a comment. Write a test
confirming the limit actually triggers a 429.
```

**Soft delete on Booking/Customer**
```
Add an IsDeleted flag and a global EF Core query filter to Booking and Customer so cancelled/
removed records stay in the database for audit purposes but don't show up in normal queries.
Confirm existing queries still work correctly with the filter applied.
```

**Seed script for demo data**
```
Write a seed script (dotnet run --seed or a dedicated console command) that creates one demo
business with realistic PH service-business data: a handful of services, 2-3 staff with weekly
schedules, and a mix of past/upcoming bookings in different statuses. This needs to make the demo
look real on first clone, not empty.
```

---

## Phase 6 – Deploy & Document

**Provision Postgres (Neon/Supabase)**
```
Walk me through provisioning a free-tier Postgres instance on Neon (or Supabase), applying the
existing migrations against it, and confirming connectivity from a local test connection string.
```

**Deploy API (Fly.io/Railway/Render paid tier)**
```
Set up deployment for the API on Fly.io (avoiding Render's free-tier cold starts per the review
notes). Write the fly.toml / Dockerfile changes needed, and confirm the health check endpoint
responds correctly once deployed.
```

**Deploy client to Vercel**
```
Configure the React client for Vercel deployment: vercel.json if needed, environment variable
for VITE_API_URL pointing at the deployed API, and confirm the production build works locally
first with `npm run build && npm run preview`.
```

**Wire up GitHub Actions CI (build + test)**
```
Add .github/workflows/ci.yml exactly per the plan's Phase 8.1, running on push and PR, with the
Postgres service container for integration tests. Confirm it passes on a test PR.
```

**Wire up GitHub Actions CD (API + client)**
```
Add the cd-api.yml and cd-client.yml workflows per the plan's Phase 8.1, scoped to only trigger
on changes to their respective paths. Add the required secrets to a checklist in the README
rather than guessing values.
```

**Write README**
```
Write a README.md with: a Mermaid architecture diagram, local setup instructions via docker
compose, the full environment variable list, a link to the API docs (Scalar), the deployment
guide, and placeholders for screenshots/GIFs I'll add after the demo recording.
```

**Write RA 10173 / data-privacy note for README**
```
Add a short, honest section to the README explaining how this system handles customer PII under
the Philippines Data Privacy Act (RA 10173) — what's collected, why, and how it's stored. Keep
it to one paragraph; this is a signal of maturity, not a legal document.
```

**Write portfolio case study**
```
Draft a case-study document (problem statement, tech stack and why, architecture decisions,
challenges and solutions, what I'd improve next, live demo + repo links) based on what was
actually built across this project — pull real details from the codebase and commit history
rather than generic phrasing.
```

**Record demo GIF/video**
```
Give me a script/shot list for a 60-90 second demo recording covering: landing page, the booking
wizard through payment, the staff calendar receiving a live SignalR update, and the admin
settings page. Keep it tight — one clear path, not a full feature tour.
```
