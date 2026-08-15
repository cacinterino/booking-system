# Tasks: Public Booking Wizard

**Input**: Design documents from `specs/002-public-booking-wizard/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included — unit tests are repo convention (constitution: all tests pass before merge) and the plan's structure lists them for the new DTOs/handlers.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `src/Booking.*` at repo root (Clean Architecture: Domain / Application / Infrastructure / Api)
- Tests: `tests/Booking.UnitTests/`
- Client: `booking-client/src/`
- Specs: `specs/002-public-booking-wizard/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Branch + spec artifacts ready before any code.

- [ ] T001 Confirm working branch is `feat/6.1-booking-wizard` (branch from `main`); commit the ratified spec/plan/tasks artifacts in `specs/002-public-booking-wizard/`
- [ ] T002 [P] Verify `dotnet test Booking.sln` and `npm run build` (in `booking-client/`) both pass on the clean `main` baseline before any edits

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The public discovery API — shared by every user story. Everything a guest needs to resolve a business and see services/staff/availability.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

**Gates**: Availability engine and booking write path are NOT modified (constitution II + III). `[AllowAnonymous]` only on read-only public routes.

- [X] T003 [P] Add `PublicBusinessResponse` record (Id, Name, Slug, Description, Timezone, RequireDeposit, DepositAmount, Currency, AdvanceBookingDays, SlotIntervalMinutes) in `src/Booking.Application/Business/DTOs/BusinessDtos.cs`
- [X] T004 [P] Add `PublicStaffResponse` record (Id, FullName, DisplayOrder, ServiceIds — NO email/phone/avatar) in `src/Booking.Application/Staff/DTOs/StaffDtos.cs`
- [X] T005 Add `GetPublicBusinessQuery(string Slug)` + handler mapping `Business` + `BusinessSettings` to `PublicBusinessResponse`, throwing `KeyNotFoundException` on null slug, in `src/Booking.Application/Business/Queries/WorkspaceQueries.cs` and `src/Booking.Application/Business/Handlers/WorkspaceQueryHandler.cs`
- [X] T006 Add `PublicStaffResponse` mapper (from `StaffResponse`, dropping Email/Phone/AvatarUrl) in `src/Booking.Application/Staff/Handlers/StaffQueryHandlers.cs` (or a small static mapper class next to it)
- [X] T007 [P] Create `PublicBookingController` in `src/Booking.Api/Controllers/PublicBookingController.cs`: `[AllowAnonymous]`, route `api/public/businesses/{slug}`, injecting `IBusinessRepository.GetBySlugAsync` to resolve slug → businessId, 404 on unknown slug
- [X] T008 [US1] Add `GET api/public/businesses/{slug}` → `PublicBusinessResponse` in `src/Booking.Api/Controllers/PublicBookingController.cs` (dispatch T005 query)
- [X] T009 [US1] Add `GET api/public/businesses/{slug}/services` → `ServiceResponse[]` (active only) in `src/Booking.Api/Controllers/PublicBookingController.cs` (reuse `GetServicesQuery`, `IncludeInactive: false`)
- [X] T010 [US1] Add `GET api/public/businesses/{slug}/staff?serviceId=` → `PublicStaffResponse[]` (PII stripped) in `src/Booking.Api/Controllers/PublicBookingController.cs` (reuse `GetStaffQuery` / `GetStaffByServiceQuery` + T006 mapper)
- [X] T011 [US1] Add `GET api/public/businesses/{slug}/availability?serviceId=&date=&staffId=` → `AvailabilityResponse` in `src/Booking.Api/Controllers/PublicBookingController.cs` (reuse `GetAvailabilityQuery` unchanged; inject slug-resolved businessId)
- [X] T012 [P] Unit tests for `GetPublicBusinessQueryHandler` (slug resolve, unknown-slug 404, settings mapped) in `tests/Booking.UnitTests/Business/PublicBusinessQueryTests.cs`
- [X] T013 [P] Unit tests for the public staff mapper (PII stripped, serviceIds preserved) in `tests/Booking.UnitTests/Staff/PublicStaffMapperTests.cs`

**Checkpoint**: Foundation ready — public discovery API complete and unit-tested; all 4 endpoints in `contracts/booking-public-api.md` callable anonymously. **This is the backend slice; commit + PR here per one-slice-per-session.**

---

## Phase 3: User Story 1 - Book an appointment as a guest (Priority: P1) 🎯 MVP

**Goal**: Guest opens `/book/:businessSlug`, picks service → staff → date/time → details, books without an account.

**Independent Test**: `npm run dev` in `booking-client/`, open `http://localhost:5173/book/<slug>` against the Docker API, complete a booking end-to-end; it appears in the owner/staff list.

### Implementation for User Story 1

- [X] T014 [P] [US1] Add `booking-client/src/features/booking/types.ts` — `PublicBusiness`, `PublicStaff`, `Service` (reuse), `AvailabilityResponse`, `CreateBookingRequest`, `BookingResponse` types per `contracts/booking-public-api.md`
- [X] T015 [P] [US1] Add `booking-client/src/features/booking/api.ts` — axios functions: `getPublicBusiness`, `getPublicServices`, `getPublicStaff`, `getAvailability`, `createBooking` (with `Idempotency-Key` header, `startTime` = slot `startUtc`, UTC `Z`), `getMyBookings`
- [X] T016 [P] [US1] Add TanStack Query hooks in `booking-client/src/features/booking/hooks.ts`
- [X] T017 [US1] Create `BookingWizardPage.tsx` in `booking-client/src/features/booking/BookingWizardPage.tsx` — step container (Service → Staff → DateTime → Details → Confirmation), friendly states for not-found/no-services/fully-booked (FR-014), register route `/book/:businessSlug` in `booking-client/src/App.tsx`
- [X] T018 [P] [US1] `ServiceStep` component in `booking-client/src/features/booking/components/ServiceStep.tsx` — active services with price/duration/category
- [X] T019 [P] [US1] `StaffStep` component in `booking-client/src/features/booking/components/StaffStep.tsx` — eligible staff for selected service (name only)
- [X] T020 [P] [US1] `DateTimeStep` component in `booking-client/src/features/booking/components/DateTimeStep.tsx` — pick date, fetch availability, render slots grouped by staff; **never synthesize times; use slot `startUtc` verbatim** (research decision 5)
- [X] T021 [P] [US1] `DetailsStep` component in `booking-client/src/features/booking/components/DetailsStep.tsx` — name, email (validated), optional phone; deposit disclosure when `requireDeposit` (FR-013)
- [X] T022 [US1] Wire the submit flow in `BookingWizardPage.tsx` — call `createBooking`, hold an idempotency key per wizard attempt, map 409/400/404 Problem Details to friendly messages, store the created booking for the confirmation screen

**Checkpoint**: US1 fully functional and testable independently — a guest can book end-to-end.

---

## Phase 4: User Story 2 - Handle a slot that becomes taken (Priority: P1)

**Goal**: When two visitors race for the same slot, the loser gets a clear "taken" message and fresh times — never a crash.

**Independent Test**: Open the wizard in two browsers on the same slot; submit both. Exactly one success, the other shows "slot no longer available" with refreshed times.

### Implementation for User Story 2

- [X] T023 [P] [US2] Handle 409 in the submit path in `booking-client/src/features/booking/BookingWizardPage.tsx` — detect `status === 409`, show the conflict message, automatically refresh availability for the selected date
- [X] T024 [US2] Add "Slot just taken — here are the next free times" UI state in `booking-client/src/features/booking/components/DateTimeStep.tsx`; offer re-selection with the same idempotency key invalidated

**Checkpoint**: US1 + US2 both work — race behaves per constitution III.

---

## Phase 5: User Story 3 - Confirm and remember the booking (Priority: P2)

**Goal**: Confirmation screen with summary, reference, and access code; guest can look up upcoming booking with the code.

**Independent Test**: Complete a booking, see confirmation; enter the access code on the wizard to view the upcoming booking.

### Implementation for User Story 3

- [X] T025 [P] [US3] `ConfirmationStep` component in `booking-client/src/features/booking/components/ConfirmationStep.tsx` — booking summary, reference, access code (FR-011), copy-to-clipboard for the code
- [X] T026 [US3] Add access-code lookup UI in `BookingWizardPage.tsx` (or a small `MyBookingLookup` component) — call `getMyBookings(accessCode)`, show upcoming booking(s) (FR-012); link from confirmation and the wizard entry

**Checkpoint**: US1–US3 all work — full guest journey.

---

## Phase 6: User Story 4 - Guest-only contact details (Priority: P2)

**Goal**: Guests book with name + email only; staff PII never exposed.

**Independent Test**: Booking completes with name + valid email, no account created; staff responses contain no email/phone (covered in T013; UI renders name only).

### Implementation for User Story 4

- [X] T027 [US4] Verify no account/auth is involved in the wizard flow in `booking-client/src/features/booking/` (US1 path is fully anonymous; remove any auth-gated component if one leaked in)
- [X] T028 [US4] Verify public staff rendering uses `PublicStaffResponse` name only and never requests/renders `email`, `phone`, or `avatarUrl` in `StaffStep.tsx` and `api.ts`

**Checkpoint**: All four user stories independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Integration, validation, and slice handoff.

- [X] T029 [P] Run `dotnet test Booking.sln` (all unit + integration green, incl. existing 4.4 availability/booking tests untouched)
- [X] T030 [P] Run `npm run build` (tsc + vite) in `booking-client/`
- [X] T031 Run the `quickstart.md` scenarios against the Docker stack (steps 1–6 incl. race smoke)
- [X] T032 Apply the Brass-Bound Ledger design system (DESIGN.md): warm paper surfaces, hairline borders, brass single-accent, Fraunces + IBM Plex, flat-by-default elevation across all wizard components
- [ ] T033 Security review (human) of the `[AllowAnonymous]` public routes — confirm read-only, no PII, no write/role changes; sign off in `specs/002-public-booking-wizard/`
- [ ] T034 Commit backend slice (Phase 2) separately, then client slice (Phases 3–7) separately on `feat/6.1-booking-wizard`; open PR → `main` with test results; update `REMAINING_TASKS_PLAN.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — already on `feat/6.1-booking-wizard`
- **Foundational (Phase 2)**: Depends on Setup; **BLOCKS all user stories** (the public API is their data source)
- **User Stories (Phase 3+)**: All depend on Phase 2
  - US1 (Phase 3) → US2 (Phase 4) → US3 (Phase 5) → US4 (Phase 6), sequential per repo's one-slice rule
- **Polish (Phase 7)**: Depends on all stories complete

### User Story Dependencies

- **US1 (P1)**: after Phase 2; no deps on other stories
- **US2 (P1)**: after US1 (needs the submit path to test the 409 race)
- **US3 (P2)**: after US1 (needs a created booking + access code)
- **US4 (P2)**: mostly verified within US1/Phase 2; cleanup tasks independent

### Within Each User Story

- DTOs/types → API clients → hooks → components → wiring (data before UI)
- Backend endpoint before the client that consumes it
- Story complete before moving to next priority

### Parallel Opportunities

- Phase 1: none meaningful (2 quick checks)
- Phase 2: T003/T004/T007 and T012/T013 are independent; T008–T011 depend on the DTOs/query/controller being present
- Phase 3: T014/T015/T016 and T018–T021 are independent components (mark [P]); T017/T022 depend on them
- Phase 5: T025/T026 independent of Phase 4
- Phase 7: T029/T030 can run in parallel

---

## Parallel Example: Phase 2 (backend slice)

```bash
# DTOs + controller skeleton first (independent):
Task: "T003 PublicBusinessResponse DTO"
Task: "T004 PublicStaffResponse DTO"
Task: "T007 PublicBookingController skeleton + slug resolution"

# Then the four endpoints (depend on the above):
Task: "T008 business, T009 services, T010 staff, T011 availability"
```

## Parallel Example: Phase 3 (client slice)

```bash
# Foundation files in parallel:
Task: "T014 types.ts"
Task: "T015 api.ts"
Task: "T016 hooks.ts"
Task: "T018 ServiceStep, T019 StaffStep, T020 DateTimeStep, T021 DetailsStep"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (commit spec artifacts)
2. Complete Phase 2: Foundational — **public discovery API (backend slice; commit + PR here)**
3. Complete Phase 3: User Story 1 (wizard UI)
4. **STOP and VALIDATE**: Test US1 independently (end-to-end booking)
5. Demo ready

### Incremental Delivery

1. Phase 2 → public API → **backend slice PR** → demo discovery
2. Add US1 (Phase 3) → book end-to-end → demo
3. Add US2 (Phase 4) → race handled → demo
4. Add US3 (Phase 5) → confirmation + lookup → demo
5. Add US4 (Phase 6) → privacy verified → demo
6. Phase 7 polish + design system pass → full PR

### Slice Handoff (this session)

**Backend slice (Phase 2)** is the current session's deliverable: public discovery API + unit tests. The client (Phases 3–7) is the next session's slice, built on the documented contract. Commit + PR the backend slice independently, per AGENTS.md one-feature-slice-per-session.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Constitution gates: do NOT modify the availability engine (II) or booking write path (III); keep `[AllowAnonymous]` read-only (Security)
- Time rule: client always submits slot `startUtc` (UTC `Z`), never synthesized or Manila-local times
- Commit after each logical group; stop at checkpoints to validate independently
