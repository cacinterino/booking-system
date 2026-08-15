# Feature Specification: Booking Flow

**Feature Branch**: `feat/4.4-booking`

**Created**: 2026-08-08

**Status**: Draft

**Input**: User description: "we have a current list of remaining tasks here @REMAINING_TASKS_PLAN.md and yet we havent yet to implement. "

## User Scenarios & Testing

### User Story 1 - Customer books an appointment (Priority: P1)

A customer picks a service, a staff member, and an available time slot and confirms a booking. The booking is accepted only if the slot is genuinely open at the moment of confirmation. If two customers try to book the same slot at the same instant, exactly one succeeds and the other is told the slot is no longer available — they are never met with a confusing error.

**Why this priority**: This is the app's core value — a booking system that cannot book reliably is not a booking system. Everything else (cancel, reschedule, dashboards) builds on this foundation.

**Independent Test**: Can be fully tested by confirming a booking from an available slot and verifying it appears as confirmed, plus a concurrent test where two identical requests produce exactly one success and one clean rejection.

**Acceptance Scenarios**:

1. **Given** a service, staff member, and date/time slot shown as available, **When** the customer confirms a booking, **Then** the booking is created and the slot is no longer available to others.
2. **Given** a slot that has just been booked by someone else, **When** a customer attempts to book it, **Then** they receive a clear "slot no longer available" response (not a system error).
3. **Given** two simultaneous booking attempts for the same slot, **When** both are processed, **Then** exactly one succeeds and the other is cleanly rejected.
4. **Given** a customer who never returned the confirm form, **When** they retry the same booking with the same request identifier, **Then** they do not create a duplicate.

---

### User Story 2 - Customer views, cancels, and reschedules bookings (Priority: P2)

A customer can see their upcoming and past bookings. They can cancel an upcoming booking, and they can move an upcoming booking to a different available time slot. Rescheduling is subject to the same availability guarantee as a new booking.

**Why this priority**: Real-world customers change plans. Without cancel/reschedule, a stale booking leads to a no-show, which this product's deposit strategy is designed to reduce.

**Independent Test**: Can be fully tested by creating a booking, listing "my bookings", cancelling it, and confirming it disappears from upcoming; and by moving a booking to a new available slot and verifying the old slot frees up.

**Acceptance Scenarios**:

1. **Given** a customer with existing bookings, **When** they view their bookings, **Then** they see upcoming and past bookings with status.
2. **Given** an upcoming booking, **When** the customer cancels it, **Then** it is marked cancelled and the slot becomes available again.
3. **Given** an upcoming booking, **When** the customer reschedules to a new available slot, **Then** the booking moves and the old slot frees up.
4. **Given** a reschedule request for a slot that was just taken by someone else, **When** confirmed, **Then** the customer is cleanly told the new slot is unavailable and their original booking is unchanged.
5. **Given** a completed or cancelled booking, **When** the customer tries to cancel or reschedule it, **Then** they are told it is not possible.

---

### User Story 3 - Staff and admin manage bookings and see their calendar (Priority: P3)

Staff see their bookings on a calendar and can confirm, complete, or mark a booking as no-show. Admin can view all bookings and filter by status, staff, and date.

**Why this priority**: Operational tooling matters for a business, but a customer who can book is the product. Staff workflow builds on the customer-facing flow.

**Independent Test**: Can be fully tested by marking a booking as confirmed/complete/no-show and verifying the status change, and by filtering the booking list by staff/date/status.

**Acceptance Scenarios**:

1. **Given** a staff member with bookings, **When** they view their calendar, **Then** they see their bookings as events on the relevant day/time.
2. **Given** a pending booking, **When** staff confirms it, **Then** the booking status becomes confirmed.
3. **Given** a completed appointment, **When** staff marks it complete, **Then** the status becomes completed.
4. **Given** a customer who did not arrive, **When** staff marks the booking as no-show, **Then** the status becomes no-show.
5. **Given** an admin viewing all bookings, **When** they filter by status, staff, or date, **Then** only matching bookings are shown.

---

### Edge Cases

- What happens when a customer books a slot at exactly the same time the availability window closes?
- How does the system handle two identical booking requests sent twice by accident (duplicate submission)?
- What happens when a customer reschedules to a slot in the past?
- How does the system respond when a customer tries to cancel a booking that is already past its start time?
- What happens when a customer books the final available slot of a fully-booked day?
- How does the system handle a booking request for a date/time where the staff member has no schedule?
- What happens if a cancellation and a reschedule for the same booking arrive at the same time?

## Requirements

### Functional Requirements

- **FR-001**: The system MUST allow a customer to create a booking for a service, staff member, and time slot that is available at the moment of creation.
- **FR-002**: The system MUST guarantee that two simultaneous booking attempts for the same slot result in exactly one success.
- **FR-003**: The system MUST respond to the unsuccessful participant in a concurrent booking with a clear "slot no longer available" outcome — never a generic system error.
- **FR-004**: The system MUST treat a repeated booking request carrying the same request identifier as a single booking, not a duplicate.
- **FR-005**: The system MUST prevent bookings that would double-book a staff member's time for overlapping periods.
- **FR-006**: The system MUST validate the chosen slot against current availability before persisting a booking.
- **FR-007**: The system MUST allow a customer to list their own upcoming and past bookings.
- **FR-008**: The system MUST allow a customer to cancel an upcoming booking, freeing the slot.
- **FR-009**: The system MUST allow a customer to reschedule an upcoming booking to another available slot, re-running the availability check.
- **FR-010**: The system MUST allow staff to confirm, complete, or mark a booking as no-show.
- **FR-011**: The system MUST allow staff to view their own bookings in a calendar layout.
- **FR-012**: The system MUST allow an admin to list all bookings and filter by status, staff, and date.
- **FR-013**: The system MUST prevent cancellation or rescheduling of bookings that are completed, cancelled, or already started.
- **FR-014**: The system MUST reflect booking changes in availability immediately (a new booking closes the slot; a cancel or reschedule frees the old slot).
- **FR-015**: The system MUST support booking creation for both guests and authenticated customers. Guests provide contact details and receive a way to later retrieve and manage their booking.
- **FR-016**: The system MUST record a booking confirmation for every booking so it can be sent later; external delivery (email/SMS) is out of scope for this slice.

### Key Entities

- **Booking**: Represents one appointment — service, staff member, customer, start/end time, status, and a request identifier for duplicate protection. Relates to Service, Staff, and Customer.
- **BookingStatus**: The lifecycle state of a booking (e.g., pending, confirmed, completed, cancelled, no-show).
- **Customer**: The person making the booking; may be an authenticated account or a guest with contact details.
- **Service**: The offering being booked, which determines the appointment duration.
- **Staff**: The professional providing the service; their schedule bounds which slots exist.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A customer can create a booking in under 2 minutes from first page load.
- **SC-002**: In a concurrent double-booking test of 100 attempts, exactly one succeeds per slot and the other 99 receive a clear "unavailable" result with zero system errors.
- **SC-003**: No two bookings ever exist for the same staff member with overlapping time periods.
- **SC-004**: A customer can cancel or reschedule a booking in under 1 minute and the change is reflected in availability immediately.
- **SC-005**: 95% of booking submissions complete without the customer having to retry.
- **SC-006**: Duplicate submissions of the same booking request never create more than one booking.

## Assumptions

- Scope of this feature slice is the booking lifecycle (create, my-bookings, cancel, reschedule, staff/admin status + calendar). The customer-facing screens and dashboards are a separate frontend feature that consumes this.
- The availability engine already exists and is the source of truth for what is bookable.
- Payments are out of scope for this slice: deposits are optional and a booking can be created without payment.
- Notifications (email/SMS) are a deferred phase; a booking confirmation record exists in-app even if no external message is sent yet.
- Guests can book without an account and provide contact details plus a way to retrieve/manage their booking.
- Time is handled per the project's timezone policy (UTC internally, local only at the boundary).
- Duplicate protection uses a client-supplied request identifier for safe retries.
