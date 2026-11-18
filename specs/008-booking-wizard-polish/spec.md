# Spec: Booking Wizard Polish

**Feature:** Polish the /book/:businessSlug public booking wizard with shared UI components and design system rigor
**Phase:** 6 of Showcase Readiness Plan  
**Status:** In Progress  
**Branch:** `feat/booking-wizard-polish` (from `develop`)

## WHAT

Apply shared UI components and design system to the public booking wizard (Service → Staff → Date/Time → Confirm flow).

**Steps to polish:**
- ServiceStep.tsx — Service selection cards with price/duration
- StaffStep.tsx — Staff selection cards
- DateTimeStep.tsx — Date chips + time slot grid
- DetailsStep.tsx — Guest contact form
- ConfirmationStep.tsx — Confirmation with brass "stamp" visual

## KEY DECISIONS

Use shared Ticket component for service/staff cards. Keep existing 409 conflict handling and idempotency logic. Progress stepper uses mono labels.

## ACCEPTANCE CRITERIA

- All 5 wizard steps use shared Card/Ticket/Button/Input
- Eyebrow above each step headline
- Brass focus rings on form inputs
- Progress stepper with mono labels
- Confirmation step has brass "Confirmed" visual
- 409 conflict handling preserved
- Idempotency key logic preserved
- Impeccable audit passes on wizard components
- Responsive at 375px–1440px
