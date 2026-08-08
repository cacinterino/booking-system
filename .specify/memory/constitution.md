<!--
# Sync Impact Report

- Version change: (none) → v1.0.0
- Modified principles: none (initial ratification)
- Added sections: Core Principles (I–V), Market & Compliance Constraints,
  Security, Development Workflow
- Removed sections: none
- Follow-up TODOs: none
-->

# Appointment Booking System Constitution

## Core Principles

### I. Spec-First — What and Why Before How

The `spec.md` at the top of every feature defines WHAT the user needs and WHY
they need it, never HOW to build it. Do not leak technology, architecture,
frameworks, or UI specifics into the specification. The WHAT and WHY are
ratified before any planning; the plan (`/speckit.plan`) is the only place
where technical decisions are recorded. The system is not built from a
bare prompt — it is built from an approved spec, plan, and task list.

### II. Availability Engine Integrity (NON-NEGOTIABLE)

The availability engine — combining staff schedules, schedule overrides,
existing bookings, and service duration into per-day available slots — is the
heart of the product. Any change that touches it MUST ship with tests covering
every protected scenario:

- No bookings on the day
- Fully booked day
- Overrides adding and removing availability
- Midnight timezone edge cases

A merge that touches the engine without all engine tests green is rejected.

### III. Zero Double-Booking

Two simultaneous bookings for the same slot MUST result in exactly one
success and a clean 409 for the other — never a 500. This is enforced by BOTH:

- a Postgres exclusion constraint on `(StaffId, StartTime)`, and
- an idempotency key on `POST /api/bookings`

Both mechanisms are mandatory together; removing or weakening either one is a
governance-level change. Double-booking silence or a 500-class failure in a
concurrency test is a launch-blocking defect.

### IV. Domain Purity

`Booking.Domain` carries ZERO dependencies: no Entity Framework, no MediatR,
no external packages — by library reference or transitive. All entities live
there with no EF attributes and no framework concerns. Lifecycle, CQRS, and
persistence concerns belong to `Booking.Application` and `Booking.Infrastructure`.
Infrastructure defers to the domain, never the reverse.

### V. Timezone Discipline

All timestamps are stored and persisted in UTC. `Asia/Manila` timezone
conversion happens in exactly one place: the API response boundary (DTO
mapping) and nowhere else in the pipeline. Never call local time inside
ephemeral, domain, or infrastructural business logic. Treating Manila time
as a storage unit is a bug, not a preference.

## Market & Compliance Constraints

### Market Scope

- Serve the Philippines market exclusively.
- Payments via PayMongo (GCash/Maya) for deposit collection
  to reduce no-shows.
- SMS notifications use the Semaphore PH provider for reachability.

### Data Privacy (RA 10173)

- Minimise PII collection to only what the booking flows require.
- Document in the README: what PII is collected, why, where it is
  stored, and how it is protected. No opportunistic collection.

### Soft Delete

- `Booking` and `Customer` are soft-deleted via an `IsDeleted` flag with a
  global query filter. Physical delete is allowed only via explicit,
  reviewed migration. Every query that touches these entities must respect
  the filter unless a specific reason not to is documented.

## Security

- Any authentication, authorization, token, or Payment handling code MUST
  undergo line-by-line human review before merge. AI output for Auth/security
  is treated as a first draft only, never as reviewed output.
- Treat AI-generated security code as unreviewed until a human signs off.
- Secrets and keys never reach the repository under any circumstance.

## Development Workflow

- Never commit directly to `main` or `release/*`. All work goes through a
  `feat/*` or `bugfix/*` branch and merges via pull request.
- One feature slice per session — small, reviewable chunks.
- All tests (unit + integration, including availability-engine coverage)
  MUST pass before merging.
- Slice outcomes are committed to the plan and reflected back in the spec;
  drift between spec/plan/tasks and code is reconciled explicitly.

## Governance

- This constitution is the authority; it overrides convenience in any
  dispute. Any conflict is resolved in favor of the constitution's
  principle.
- Any change to the double-booking exclusion constraint or the auth flow is
  a governance change and requires a documented amendment plus a migration
  plan — it is never a drive-by edit.
- Amendments: version under semantic versioning (MAJOR for removals or
  redefinitions of a principle, MINOR for added principles/sections, PATCH for
  clarifications) and are recorded with a date and rationale.
- All drafts pass a compliance review: each PR and each task list is
  checked for constitution alignment before merge. Failure is a blocker, not
  a suggestion.

**Version**: 1.0.0 | **Ratified**: 2026-08-08 | **Last Amended**: 2026-08-08