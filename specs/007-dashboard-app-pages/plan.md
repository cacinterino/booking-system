# Plan: Dashboard & App Pages

**Spec:** `specs/007-dashboard-app-pages/spec.md`  
**Phase:** 5 of Showcase Readiness Plan  
**Branch:** `feat/dashboard-app-pages` (from `develop`)

---

## Architecture & Layout Plan

```
App Shell (Navbar + Outlet)
  ├── DashboardPage (Overview, KPIs, Quick Actions, Activity Ledger)
  ├── StaffDashboardPage (Schedule Navigator, Timeline, Status Transition)
  ├── AdminServicesPage (Category Filter, Service Cards, Service/Category Modals)
  ├── AdminStaffPage (Staff Members, Schedule Manager, Override Modals)
  └── MyBookingsPage (Guest Access Code Lookup, Upcoming/Past Appointment Tickets)
```

## Implementation Phases

### 1. Shared UI Foundation
- Verify and integrate all components in `booking-client/src/shared/ui/`:
  - `Button` (primary, secondary, danger, outline)
  - `Card` (soft ivory, hairline border, subtle interaction hover)
  - `Input` (brass focus ring, mono label, error states)
  - `Badge` (pill with mono uppercase text, brass/sage/slate/red variants)
  - `SectionHeader` (mono eyebrow + Fraunces display title)
  - `LoadingSkeleton` (animated pulse with ink/10 opacity)
  - `EmptyState` (brass icon ring, title, description, and primary CTA)
  - `Modal` (editorial header, backdrop blur, accessible keyboard/focus handling)
  - `Ticket` (editorial receipt aesthetic for appointments)

### 2. Page Polish Sequence
1. **`Navbar.tsx`**: Add role badge pill, active tab indicator, editorial wordmark with brass dot.
2. **`DashboardPage.tsx`**: Eyebrow, Fraunces heading, 3 KPI cards with subtle brass icons, 4 quick action tiles, and an upcoming schedule preview or empty ledger state.
3. **`StaffDashboardPage.tsx`**: Week day-picker bar, appointment count badges, status badges, calendar event cards with action buttons (Confirm, Complete, No Show).
4. **`AdminServicesPage.tsx`**: Filter tabs by category, service summary cards with duration / price badges (`₱`), polished modal forms.
5. **`AdminStaffPage.tsx`**: Staff card grid with role badges, active schedules display, and clean modals for schedule configuration.
6. **`MyBookingsPage.tsx`**: Access code card with brass focus ring, upcoming vs past appointment ticket view, cancel/reschedule controls.

### 3. Verification & Build
- Run TypeScript type checks (`npx tsc --noEmit`).
- Verify production build.
- Confirm all acceptance criteria are met.
