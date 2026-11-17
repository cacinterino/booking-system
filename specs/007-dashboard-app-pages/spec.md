# Spec: Dashboard & App Pages

**Feature:** Transform internal app and dashboard pages into the cohesive "Brass-Bound Ledger" editorial design system
**Phase:** 5 of Showcase Readiness Plan  
**Status:** In Progress  
**Branch:** `feat/dashboard-app-pages` (from `develop`)

---

## WHAT

Elevate all primary application and dashboard screens from plain/unstyled interfaces to polished, showcase-ready editorial experiences matching `DESIGN.md` and `PRODUCT.md` ("The Brass-Bound Ledger").

**Target Pages and Components:**

| Page / Component | File | Purpose |
|------------------|------|---------|
| `DashboardPage` | `booking-client/src/pages/DashboardPage.tsx` | Owner/business overview with KPI cards, quick actions, and recent activity |
| `StaffDashboardPage` | `booking-client/src/features/staff/StaffDashboardPage.tsx` | Staff daily schedule, week selector, calendar events, and booking status workflow |
| `AdminServicesPage` | `booking-client/src/features/services/AdminServicesPage.tsx` | Services & categories management with modals, pricing, and duration tags |
| `AdminStaffPage` | `booking-client/src/features/staff/AdminStaffPage.tsx` | Team management, working hours, overrides, and invitation workflows |
| `MyBookingsPage` | `booking-client/src/features/booking/MyBookingsPage.tsx` | Customer appointment ledger, access code lookup, upcoming/past appointments, cancel/reschedule |
| `Navbar` & Shell | `booking-client/src/shared/components/Navbar.tsx` | Sticky translucent navigation, role badge, user profile, and mobile drawer |

**Design System Rigor:**
- Every page begins with a mono brass uppercase eyebrow and a Fraunces display headline.
- Warm Paper surfaces (`#F5F0E4`), Soft Ivory card backgrounds (`#FFFDF8`), and Ink text (`#14213D`).
- Antique brass (`#B8862B`) used strictly as an accent (≤10% of viewport area) — buttons, active indicators, and focus rings.
- Flat-by-default surfaces with hairline borders (`rgba(20, 33, 61, 0.14)`) and subtle elevation on interaction.
- Shared UI components utilized consistently (`Card`, `Button`, `Input`, `Badge`, `EmptyState`, `LoadingSkeleton`, `Modal`, `SectionHeader`).
- Microcopy customized for Philippine service businesses (PHP `₱` formatting, Manila timezone context, friendly tone).

---

## WHY

The dashboard and internal app pages are what prospective employers, clients, and evaluators inspect during live demos. Generic Bootstrap-like cards or inconsistent styles break immersion and look like unfinished coursework. A cohesive editorial aesthetic across all internal pages establishes high craft, attention to detail, and production readiness.

---

## KEY DECISIONS

| Decision | Rationale |
|----------|-----------|
| Standardize on shared UI components (`shared/ui/`) | Guarantees visual consistency across dashboard, staff, services, and booking management |
| Retain existing data fetching hooks and mutations | Preserves clean architecture integration with ASP.NET Core API without regressing business logic |
| Currency formatting in Philippine Pesos (`₱` / `PHP`) | Aligns with market-specific rules in `AGENTS.md` and `DESIGN.md` |
| Cohesive Empty & Loading states | Replaces jarring spinners and blank screens with informative skeletons and guided empty states |

---

## ACCEPTANCE CRITERIA

- [ ] All 5 key app pages (`DashboardPage`, `StaffDashboardPage`, `AdminServicesPage`, `AdminStaffPage`, `MyBookingsPage`) and `Navbar` follow the Brass-Bound Ledger design system.
- [ ] Uppercase mono brass eyebrow above every page/section headline.
- [ ] Shared UI components (`Button`, `Card`, `Badge`, `Input`, `Modal`, `LoadingSkeleton`, `EmptyState`) used consistently across all app views.
- [ ] No hardcoded stark white/grey backgrounds; warm paper and soft ivory used uniformly.
- [ ] Brass accents kept under 10% screen coverage.
- [ ] Currency values formatted as `₱` (Philippine Peso) with proper decimal precision.
- [ ] TypeScript compilation (`tsc --noEmit`) passes with zero errors.
- [ ] Client builds cleanly without errors.
