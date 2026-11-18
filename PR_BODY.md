Phase 6 complete:

**Booking Wizard polished with shared UI components:**

- ServiceStep.tsx — Card components for service selection, price in font-mono
- StaffStep.tsx — Card components for staff selection
- DateTimeStep.tsx — Button components for date chips and time slots, Card for empty/loading states
- DetailsStep.tsx — Input components for all form fields, Card for deposit disclosure
- ConfirmationStep.tsx — Ticket component for confirmation card, Card for details
- BookingWizardPage.tsx — LoadingSkeleton instead of LoadingSpinner, Card for slot summary

**Design system rigor:**
- Eyebrow above each step headline
- Brass focus rings on form inputs
- Progress stepper with mono labels
- Confirmation step has Ticket component visual
- 409 conflict handling preserved
- Idempotency key logic preserved
- All components use CSS vars from style.css
