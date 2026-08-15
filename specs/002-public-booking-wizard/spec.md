# Feature Specification: Public Booking Wizard

**Feature Branch**: `feat/6.1-booking-wizard`

**Created**: 2026-08-15

**Status**: Draft

**Input**: User description: "A public booking page at /book/:businessSlug where a guest can pick a service, choose staff and an available date/time, enter contact details, and book an appointment without an account. Backed by the availability engine. This is Phase 6.1 — the backend discovery endpoints (business by slug, public services, public staff, public availability) ship first, then the wizard UI."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Book an appointment as a guest (Priority: P1)

A person in the Philippines clicks the business's public booking link (e.g. a shop shares `book/the-hair-room`). They see the business name and its services with prices and durations, pick a service, see the staff who can do it, pick a date, see only the times that are actually free, enter their name/email/phone, and confirm. They receive a booking confirmation with a reference and access code they can use later. No account needed.

**Why this priority**: This is the core value of the whole product — a customer can book without calling. Without it there is nothing for the business to manage.

**Independent Test**: A visitor with the public link can complete a booking end-to-end with no login, and the booking appears for the business owner/staff afterward.

**Acceptance Scenarios**:

1. **Given** a business with active services, staff, and published schedules, **When** a guest opens the public booking link and completes the service → staff → date/time → details flow, **Then** the booking is created and they see a confirmation with reference + access code.
2. **Given** a service with no eligible staff, **When** the guest selects that service, **Then** they see a clear "no staff available" state, not an error.
3. **Given** a date with no available slots, **When** the guest picks it, **Then** they see a friendly "fully booked" state and are offered another date.

---

### User Story 2 - Handle a slot that becomes taken (Priority: P1)

Two visitors view the same slot at the same time. One books it. When the second submits, the system does not crash — it tells them the slot just got taken and offers them the next free times.

**Why this priority**: The constitution's zero-double-booking guarantee (exactly one success, clean 409, never a 500) is non-negotiable. This story is how a real visitor experiences it.

**Independent Test**: Two simultaneous submits for the same slot produce exactly one success and one clear "taken" message with fresh alternatives.

**Acceptance Scenarios**:

1. **Given** a slot is available to two visitors, **When** both submit at the same time, **Then** one succeeds and the other receives a clear "slot no longer available" message plus updated free times.
2. **Given** a guest re-submits the same booking (same details), **When** the system detects an identical prior request, **Then** it returns the original confirmation instead of creating a duplicate.

---

### User Story 3 - Confirm and remember the booking (Priority: P2)

After booking, the guest sees a confirmation screen with the appointment summary, a booking reference, and an access code, and is told how to use the code to view or change the booking later.

**Why this priority**: Without this, a guest has no way to reference their appointment and the business gets no-show confusion. It is secondary only because booking itself must come first.

**Independent Test**: A guest completes a booking and is shown a reference and access code; using that code later surfaces their booking.

**Acceptance Scenarios**:

1. **Given** a completed booking, **When** the guest finishes, **Then** they see the summary, reference, and access code on a confirmation screen.
2. **Given** a guest with an access code, **When** they return to the business's booking page, **Then** they can view their upcoming booking with it.

---

### User Story 4 - Guest-only contact details (Priority: P2)

Guests provide only the minimum contact details needed to hold the booking (name, email, phone). No account, no password.

**Why this priority**: RA 10173 data minimisation is a constitution constraint; guests must not be forced to create accounts for a single appointment.

**Independent Test**: A booking can be completed with only name + email (+ optional phone), and no account is created.

**Acceptance Scenarios**:

1. **Given** a guest booking flow, **When** a guest provides name and valid email, **Then** the booking proceeds without requiring an account.
2. **Given** the public pages, **When** staff lists are shown, **Then** staff contact details (email/phone) are not exposed.

### Edge Cases

- What happens when the business slug does not exist? → clear "not found" state on the booking page.
- What happens when a business has no active services or no staff? → explanatory empty state, not a crash.
- What happens when the guest tries a date outside the booking window (advance booking limit)? → dates are disabled/shown as unavailable.
- What happens when deposit is required but payments are deferred? → the guest is informed of the required deposit at booking time, and booking proceeds without payment (per the deferred PayMongo decision).
- What happens when a slot's time has passed while the guest was filling the form? → the booking is rejected cleanly and fresh times are offered.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a guest to open a public booking page for a business using a public, shareable business identifier (slug), without logging in.
- **FR-002**: System MUST display the business's name and description on the public booking page.
- **FR-003**: System MUST display the business's active services with name, price, duration, and category.
- **FR-004**: System MUST display the staff members eligible for a selected service.
- **FR-005**: System MUST NOT expose staff contact details (email, phone) on any public page.
- **FR-006**: System MUST show available time slots for a chosen service, date, and (optionally) staff, reflecting real schedules, overrides, and existing bookings.
- **FR-007**: System MUST let a guest provide name, valid email, and optional phone to book.
- **FR-008**: System MUST create the booking such that two simultaneous bookings for the same slot yield exactly one success and a clean conflict for the other.
- **FR-009**: System MUST, on a slot conflict, show the guest a clear message and fresh available times rather than an error.
- **FR-010**: System MUST prevent duplicate booking when a guest re-submits identical booking details.
- **FR-011**: System MUST show a confirmation with booking summary, reference, and access code after a successful booking.
- **FR-012**: System MUST allow a guest to look up their upcoming booking with an access code.
- **FR-013**: System MUST communicate a required deposit to the guest when the business requires one, while allowing the booking to proceed without payment (deferred PayMongo).
- **FR-014**: System MUST present clear, friendly states for: business not found, no services, no staff, fully booked date, and booking window expired.

### Key Entities *(include if feature involves data)*

- **Business**: The booking provider; identified publicly by its slug. Holds name, description, timezone, and business settings (booking window, deposit requirements).
- **Service**: An offering of a business (name, price, duration, category, active flag).
- **Staff**: A person who delivers services; publicly shown by name only (contact details hidden).
- **Availability Slot**: A free window computed by the availability engine for a service/date/staff; the only times the guest may book.
- **Booking**: A guest's appointment (service, staff, time, contact details, status, reference, access code).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time guest can complete a booking in under 2 minutes.
- **SC-002**: 100% of simultaneous same-slot bookings resolve to exactly one success and one clean conflict — zero crashes.
- **SC-003**: A guest whose slot was taken can reach a successful booking again within one minute.
- **SC-004**: No staff contact details appear on any public page (RA 10173 minimisation).
- **SC-005**: A guest can complete a booking with only name + email, with no account creation.

## Assumptions

- Guests book without an account; their only credential is the access code issued at booking time.
- The booking confirmation and access-code lookup are part of this wizard; a full customer dashboard is a separate feature.
- Payments remain deferred: deposit amounts are communicated but not collected. Booking proceeds regardless.
- English is the interface language (as in the current product).
- The wizard is mobile-first; most Philippine visitors book on phones.
- Dates outside the business's booking window are not offered.
- The business slug is the only public identifier needed; a business logo field does not yet exist, so the page presents the business by name.
