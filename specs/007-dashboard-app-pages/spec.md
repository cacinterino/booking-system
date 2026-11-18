# Spec: Dashboard & App Pages

**Feature:** Polish Dashboard, MyBookings, AdminServices, AdminStaff, StaffDashboard pages with shared UI components and seeded data
**Phase:** 5 of Showcase Readiness Plan  
**Status:** In Progress  
**Branch:** `feat/dashboard-app-pages` (from `develop`)

---

## WHAT

Transform the logged-in experience from empty-state-only to a professional tool with real-looking data and consistent components.

**Pages:**

| Page | Current State | Target State |
|------|--------------|--------------|
| `DashboardPage.tsx` | All stats show `0` | Seeded data, brass-accented stat cards, quick actions as cards |
| `MyBookingsPage.tsx` | Decent structure | `Ticket` cards, better empty state, status chips |
| `AdminServicesPage.tsx` | Done | `Card`, `Badge`, `Button` consistency check |
| `AdminStaffPage.tsx` | Done | `Card`, `Badge`, `Button` consistency check |
| `StaffDashboardPage.tsx` | Basic | Calendar view with data, not empty |

**Changes:**
- Replace `animate-pulse` boxes with `LoadingSkeleton`
- Replace bare empty states with `EmptyState` component
- Stat cards use brass-accented icons and proper typography
- All pages use shared UI components only

---

## WHY

A screener logging into the dashboard should see something that looks functional, not empty boxes. Seeded data + consistent components = professional product.

---

## KEY DECISIONS

| Decision | Rationale |
|----------|-----------|
| Seed data via `dotnet run --seed` (Phase 8) | Frontend needs data to display; seed script is backend concern |
| Use `LoadingSkeleton` instead of `animate-pulse` | More professional loading states |
| Use `EmptyState` for no-data screens | Branded, actionable empty states |

---

## OPEN QUESTIONS (for clarify step)

| # | Question | Options |
|---|----------|---------|
| Q1 | Should dashboard show mock data or connect to seeded API? | Mock data (frontend only) / Seeded API (full stack) |
| Q2 | Should StaffDashboard calendar be a full calendar grid or list view? | Full grid / List view (simpler) |

---

## ACCEPTANCE CRITERIA

- [ ] No `animate-pulse` boxes remain (replaced with `LoadingSkeleton`)
- [ ] No bare empty states (replaced with `EmptyState`)
- [ ] Dashboard stat cards have data (or seeded via API)
- [ ] All pages use shared `Card`, `Badge`, `Button` only
- [ ] Impeccable audit passes on all app pages
- [ ] Responsive at 375px–1440px
