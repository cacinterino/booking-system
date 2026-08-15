# Tasks: Booking Flow

**Input**: Design documents from `specs/001-booking-flow/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/booking-api.md, quickstart.md

**Tests**: Included â€” the constitution mandates availability-integrity and double-booking tests (409-not-500), and the spec's concurrency scenarios are testable requirements.

**Organization**: Tasks grouped by user story. US1 = MVP.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1, US2, US3
- Paths are exact.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Register the new bookings feature wiring so later tasks have a home.

- [ ] T001 Create `src/Booking.Application/Bookings/` folders (Commands, Queries, DTOs, Handlers, Interfaces, Validators)
- [ ] T002 Create `src/Booking.Application/Bookings/Interfaces/IBookingRepository.cs` with methods: `GetByIdAsync`, `GetByCustomerAsync`, `GetByBusinessAsync`, `GetOverlappingAsync`, `GetByIdempotencyKeyAsync`, `AddAsync`, `SaveChangesAsync`
- [ ] T003 Create `src/Booking.Application/Bookings/Interfaces/IAvailabilityCache.cs` with `Get`, `Set`, `Invalidate(businessId, staffId, startDate, endDate)`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: DB guarantee, cache indirection, domain field, and error mapping that ALL stories depend on. No story can start before this completes.

**âš ï¸ CRITICAL**: This is where the double-booking guarantee is physically installed.

- [ ] T004 Add nullable `AccessCode` property to `Booking` in `src/Booking.Domain/Booking.cs` (guest lookup code; no EF attributes)
- [ ] T005 Add `AccessCode` column mapping in `src/Booking.Infrastructure/Persistence/Configurations/BookingConfiguration.cs` and VERIFY `StartTime`/`EndTime` map to `timestamp with time zone` (required for `tstzrange`)
- [x] T006 Create raw-SQL migration `src/Booking.Infrastructure/Persistence/Migrations/<new>_AddAccessCodeAndOverlapConstraint.cs`: add `AccessCode` column; `CREATE EXTENSION IF NOT EXISTS btree_gist;` then `ALTER TABLE "Bookings" ADD CONSTRAINT "EX_bookings_StaffTime_Overlap" EXCLUDE USING gist ("StaffId" WITH =, tstzrange("StartTime","EndTime",'[)') WITH &&) WHERE ("Status" IN (1,2))`. Half-open `'[)'` bounds so adjacent slots (e.g. 04:00â€“05:00 and 05:00â€“06:00) do NOT conflict; later fixed in `FixOverlapConstraintHalfOpen` migration
- [ ] T007 Add `Down()` SQL for T006: drop constraint then `DROP EXTENSION IF EXISTS btree_gist;`
- [ ] T008 Create `src/Booking.Infrastructure/Persistence/Repositories/BookingRepository.cs` implementing `IBookingRepository` against `BookingDbContext` (per existing repo pattern, e.g. `StaffRepository`)
- [ ] T009 Create `src/Booking.Infrastructure/Persistence/Repositories/AvailabilityCache.cs` implementing `IAvailabilityCache` over `IMemoryCache`; cache key shape matches `GetAvailabilityQueryHandler` (`{BusinessId}:{ServiceId}:{StaffId-or-any}:{Date}`)
- [ ] T010 [P] Refactor `GetAvailabilityQueryHandler` in `src/Booking.Application/Availability/Handlers/GetAvailabilityQueryHandler.cs` to use `IAvailabilityCache` instead of touching `IMemoryCache` directly (behavior unchanged; 10 engine tests must stay green)
- [ ] T011 Register `IBookingRepository` and `IAvailabilityCache` as scoped in `src/Booking.Infrastructure/DependencyInjection.cs`
- [ ] T012 Apply migration against Docker Postgres and verify `\d+ "Bookings"` shows the EXCLUDE constraint

**Checkpoint**: Foundation ready â€” DB rejects overlapping bookings for the same staff at the physical layer; cache is invalidatable; domain field exists.

---

## Phase 3: User Story 1 - Customer books an appointment (Priority: P1) ðŸŽ¯ MVP

**Goal**: Create a booking from an available slot (guest + authenticated), with idempotency and exactly-one-winner double-booking protection.

**Independent Test**: POST /api/bookings with two different idempotency keys for the same free slot, fired concurrently â†’ exactly one 201 and one clean 409 (never 500). Same request re-sent with the same key â†’ 200 + same booking id.

### Tests for User Story 1

> **NOTE: Write these FIRST, ensure they FAIL before implementation (TDD for the critical algorithm).**

- [ ] T013 [P] [US1] Unit test: booking handler returns clean 409 (not 500) when repository reports an overlapping existing booking in `tests/Booking.UnitTests/Bookings/BookingCommandHandlerTests.cs`
- [ ] T014 [P] [US1] Unit test: idempotent retry returns existing booking (200) without duplicate in `tests/Booking.UnitTests/Bookings/BookingCommandHandlerTests.cs`
- [ ] T015 [P] [US1] Unit test: guest booking resolves-or-creates Customer by (BusinessId, Email) in `tests/Booking.UnitTests/Bookings/BookingCommandHandlerTests.cs`
- [ ] T016 [P] [US1] Integration test: concurrent double-booking race â†’ exactly one 201, other 409, zero 500 in `tests/Booking.IntegrationTests/Bookings/BookingConcurrencyTests.cs` (Testcontainers + Respawn)

### Implementation for User Story 1

- [ ] T017 [P] [US1] Create `BookingRequest`, `BookingResponse`, `GuestContactRequest` records in `src/Booking.Application/Bookings/DTOs/BookingDtos.cs`
- [ ] T018 [P] [US1] Create `CreateBookingRequestValidator` in `src/Booking.Application/Bookings/Validators/BookingRequestValidator.cs` (service/staff GUIDs, future start, slot boundary, guest name, email format, idempotency key required, notes â‰¤ 500)
- [ ] T019 [P] [US1] Create `CreateBookingCommand` in `src/Booking.Application/Bookings/Commands/BookingCommands.cs`
- [x] T020 [US1] Implement `CreateBookingCommandHandler` in `src/Booking.Application/Bookings/Handlers/BookingCommandHandlers.cs`: validate â†’ resolve-or-create Customer â†’ **live** availability re-check via `AvailabilityEngine` (bypassing cache) â†’ create `Booking` (Pending) + snapshot `BookingService` â†’ persist â†’ on `PostgresException 23505` return existing booking (200); on 23P01 map to 409
- [x] T021 [US1] Add `IAvailabilityCache.Invalidate` call for the booked day in the create handler (after successful persist)
- [x] T022 [US1] Create `BookingsController` in `src/Booking.Api/Controllers/BookingsController.cs` with `POST /api/bookings` (public or any authenticated; requires `Idempotency-Key` header) returning 201/200/409/400/404
- [x] T023 [US1] Register FluentValidation manual invocation in the handler (repo convention â€” validators are standalone, not DI-wired)
- [x] T024 [US1] Generate `AccessCode` for guest bookings and return it in `BookingResponse`

**Checkpoint**: US1 fully functional â€” a customer can book a real slot and a concurrent attacker cannot double-book; idempotent retries are safe.

---

## Phase 4: User Story 2 - Customer views, cancels, and reschedules (Priority: P2)

**Goal**: My-bookings list (upcoming/past), cancel frees the slot, reschedule moves to a re-verified available slot.

**Independent Test**: Create â†’ list my-bookings â†’ cancel â†’ slot reappears in availability. Create â†’ reschedule to an open slot â†’ old slot frees, new slot taken. Reschedule to a just-taken slot â†’ 409, original booking unchanged.

### Tests for User Story 2

> **NOTE: Write these FIRST, ensure they FAIL before implementation.**

- [x] T025 [P] [US2] Unit test: cancel invalidates availability cache and frees slot (mocked repo) in `tests/Booking.UnitTests/Bookings/BookingCommandHandlerTests.cs`
- [x] T026 [P] [US2] Unit test: reschedule to unavailable slot returns 409 and leaves original booking untouched in `tests/Booking.UnitTests/Bookings/BookingCommandHandlerTests.cs`
- [x] T027 [P] [US2] Integration test: full my-bookings â†’ cancel â†’ slot-free round trip in `tests/Booking.IntegrationTests/Bookings/BookingLifecycleTests.cs`

### Implementation for User Story 2

- [x] T028 [P] [US2] Create `MyBookingsQuery`, `CancelBookingCommand`, `RescheduleBookingCommand` in `src/Booking.Application/Bookings/Commands/BookingCommands.cs` and `Queries/BookingQueries.cs`
- [x] T029 [P] [US2] Create `RescheduleRequestValidator` in `src/Booking.Application/Bookings/Validators/RescheduleValidator.cs` (future start, slot boundary, accessCode for guests)
- [x] T030 [US2] Implement `MyBookingsQueryHandler` in `src/Booking.Application/Bookings/Handlers/BookingQueryHandlers.cs` (owner by CustomerId or guest accessCode; upcoming asc, past desc)
- [x] T031 [US2] Implement `CancelBookingCommandHandler` in `src/Booking.Application/Bookings/Handlers/BookingCommandHandlers.cs`: ownership check, `Booking.Cancel(reason)`, invalidate day, terminal-state guard â†’ 409
- [x] T032 [US2] Implement `RescheduleBookingCommandHandler`: ownership check, live availability re-check for new slot, `Booking.Reschedule(newStart,newEnd)`, invalidate old+new days, 23P01 â†’ 409, on failure booking unchanged
- [x] T033 [US2] Add `GET /api/bookings/my-bookings`, `POST /api/bookings/{id}/cancel`, `POST /api/bookings/{id}/reschedule` routes to `src/Booking.Api/Controllers/BookingsController.cs` (CustomerOnly policy for authenticated; guest via accessCode)

**Checkpoint**: US1 AND US2 work independently â€” customers fully manage their bookings; slots stay consistent.

---

## Phase 5: User Story 3 - Staff and admin manage bookings and see calendar (Priority: P3)

**Goal**: Staff calendar events + status transitions (confirm/complete/no-show); admin list with filters.

**Independent Test**: Staff calendar shows their bookings; status Pendingâ†’Confirmedâ†’Completed succeeds, Pendingâ†’Completed returns 409; admin list filters by status/staff/date.

### Tests for User Story 3

> **NOTE: Write these FIRST, ensure they FAIL before implementation.**

- [x] T034 [P] [US3] Unit test: SetStatus guards invalid transitions (e.g. Pendingâ†’Completed â†’ 409) in `tests/Booking.UnitTests/Bookings/BookingCommandHandlerTests.cs`
- [x] T035 [P] [US3] Integration test: calendar + status transition round trip in `tests/Booking.IntegrationTests/Bookings/BookingStaffTests.cs`

### Implementation for User Story 3

- [x] T036 [P] [US3] Create `ListBookingsQuery`, `GetCalendarQuery`, `SetBookingStatusCommand` in `src/Booking.Application/Bookings/Queries/BookingQueries.cs` and `Commands/BookingCommands.cs`
- [x] T037 [P] [US3] Create `CalendarEventDto` in `src/Booking.Application/Bookings/DTOs/BookingDtos.cs` (id, title, start, end, status, staffId, customerName; Manila ISO strings at boundary)
- [x] T038 [US3] Implement `ListBookingsQueryHandler` (admin, filters status/staffId/dateFrom/dateTo/page/pageSize) in `src/Booking.Application/Bookings/Handlers/BookingQueryHandlers.cs`
- [x] T039 [US3] Implement `GetCalendarQueryHandler` (staff â†’ own via businessId+staffId claim; admin â†’ all) in `src/Booking.Application/Bookings/Handlers/BookingQueryHandlers.cs`
- [x] T040 [US3] Implement `SetBookingStatusCommandHandler` in `src/Booking.Application/Bookings/Handlers/BookingCommandHandlers.cs`: `Booking.Confirm()` / `Complete()` / `MarkNoShow()` per request; invalid transition â†’ 409; staff restricted to own business
- [x] T041 [US3] Add `GET /api/bookings`, `GET /api/bookings/calendar`, `PUT /api/bookings/{id}/status` routes to `src/Booking.Api/Controllers/BookingsController.cs` (StaffOrAdmin policies)
- [x] T042 [US3] Extend `RescheduleBookingCommandHandler` authorization to allow staff/admin-initiated reschedule (per APPOINTMENT_BOOKING_PLAN Â§4.4 Staff/Admin block): staff of the same business may reschedule any booking; reuses the live availability re-check from T032

**Checkpoint**: All three stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Contract correctness, cache/race verification, security hardening, and validation against the run guide.

- [x] T043 [P] Ensure all endpoints convert timestamps to Asia/Manila ONLY at DTO boundary (Constitution V) in `src/Booking.Application/Bookings/`
- [x] T044 Run full `dotnet test Booking.sln` â€” all 45 existing + new unit tests and Testcontainers integration tests pass
- [x] T045 Execute `specs/001-booking-flow/quickstart.md` scenarios end-to-end against Docker API (create, idempotent retry, race 409, my-bookings, cancel, reschedule, calendar, status)
- [x] T046 [P] Security review (HUMAN, constitution-mandated): owner checks, guest accessCode handling, role policies on all booking endpoints - documented in specs/001-booking-flow/security-review.md (AI draft; HUMAN sign-off required before merge). Found+fixed idempotency-key reuse leaking a different booking (now 409 on mismatch) â€” documented before merge
- [x] T047 [P] Add rate limiting on `POST /api/bookings` and rotate-safe abuse guard (per APPOINTMENT_BOOKING_PLAN Â§8.4 pre-deploy checklist): e.g. `AspNetCore.RateLimiter` fixed-window per IP for public create
- [x] T048 [P] DEFERRED (explicit â€” do NOT implement in this slice): public confirmation link `GET /api/bookings/{id}/confirm/{token}` depends on email delivery (Phase 5 skipped; Q2 = in-system confirmation only). Record as a future task in `REMAINING_TASKS_PLAN.md` under Notifications instead of removing silently
- [x] T049 Update `REMAINING_TASKS_PLAN.md` â€” mark 4.4 items done, record push state, move confirm-link + notifications items to the deferred list

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies â€” start immediately
- **Foundational (Phase 2)**: Depends on Setup; BLOCKS all stories (DB constraint + domain field + repos)
- **US1 (Phase 3)**: After Foundational â€” no story deps
- **US2 (Phase 4)**: After Foundational â€” needs US1 create/booking entities; independent testing possible via existing seeded data
- **US3 (Phase 5)**: After Foundational â€” needs US1 booking data
- **Polish (Phase 6)**: All stories complete

### User Story Dependencies

- **US1 (P1)**: Foundational only. No deps on US2/US3.
- **US2 (P2)**: Foundational + US1 persistence (reuses `BookingRepository`); independently testable once bookings exist.
- **US3 (P3)**: Foundational + US1 persistence; independently testable once bookings exist.

### Within Each Story

- Tests (where included) written first and failing before implementation
- DTOs/validators â†’ commands/queries â†’ handlers â†’ controller
- `[P]` tasks in each phase touch disjoint files and can run concurrently

### Parallel Opportunities

- T010 with any Foundational task (disjoint: read handler vs new repos)
- US1 test tasks T013â€“T016 all `[P]` (disjoint test files/methods)
- DTO T017, validator T018, command T019 `[P]` before handler T020
- US2 T028/T029 `[P]`; US3 T036/T037 `[P]`
- Stories US2/US3 can proceed in parallel after Foundational if staffed

---

## Parallel Example: User Story 1

```bash
# Launch the four US1 test tasks together (all different files):
Task: "T013 unit: overlap -> clean 409 in BookingCommandHandlerTests.cs"
Task: "T014 unit: idempotent retry 200 in BookingCommandHandlerTests.cs"
Task: "T015 unit: guest customer resolution in BookingCommandHandlerTests.cs"
Task: "T016 integration: concurrent race in BookingConcurrencyTests.cs"

# Then launch DTO + validator + command together before the handler:
Task: "T017 BookingDtos.cs"
Task: "T018 BookingRequestValidator.cs"
Task: "T019 CreateBookingCommand"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Phases 1â€“2 complete (Foundational = DB exclusion guarantee + domain field + repos)
2. Phase 3 US1: T013â€“T016 tests (fail) â†’ T017â€“T024 implementation â†’ green
3. **STOP and VALIDATE**: run the concurrent-race integration test + quickstart scenario 1â€“3
4. Demo-capable: a slot can be booked, never double-booked, retries are safe

### Incremental Delivery

1. Foundation (Phases 1â€“2) â†’ `feat/4.4-booking` committed
2. US1 â†’ independent test â†’ commit (MVP)
3. US2 â†’ independent test â†’ commit
4. US3 â†’ independent test â†’ commit
5. Polish (Phase 6) â†’ full suite + quickstart + security review â†’ PR to `main`

### Parallel Team Strategy

- After Foundational, Developer A: US2, Developer B: US3 (US1 already done as MVP by whoever owns core)

---

## Notes

- Commit after each task or logical group; never to `main` directly (branch `feat/4.4-booking` â†’ PR)
- `[P]` = different files, no dependencies
- Verify the exclusion constraint (`T006`) actually rejects an overlapping insert with a thrown DB error before wiring the 409 mapping (T020)
- Auth/security tasks (ownership checks, guest accessCode, policies) are AI-draft-only until human-reviewed (Constitution Security clause)
