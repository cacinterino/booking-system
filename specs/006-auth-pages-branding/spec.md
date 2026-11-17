# Spec: Auth Pages Branding

**Feature:** Brand Login, Register, RegisterBusiness, AcceptInvitation, and Profile pages with the `Booked.` design system
**Phase:** 4 of Showcase Readiness Plan  
**Status:** In Progress  
**Branch:** `feat/auth-pages-branding` (from `develop`)

---

## WHAT

Replace generic card layouts on auth pages with branded, design-system-compliant versions.

**Pages:**

| Page | Current | Target |
|------|---------|--------|
| `LoginPage.tsx` | Generic Bootstrap-style card | Eyebrow + "Booked." wordmark, shared Card/Input/Button |
| `RegisterPage.tsx` | Generic Bootstrap-style card | Eyebrow + "Booked." wordmark, shared Card/Input/Button |
| `RegisterBusinessPage.tsx` | Generic Bootstrap-style card | Eyebrow + "Booked." wordmark, shared Card/Input/Button |
| `AcceptInvitationPage.tsx` | Generic Bootstrap-style card | Eyebrow + "Booked." wordmark, shared Card/Input/Button |
| `ProfilePage.tsx` | Generic card | Eyebrow + "Booked." wordmark, shared Card/Input/Button |

**Branding applied to each:**
- Eyebrow + Fraunces "Booked." wordmark
- `Card` + `Input` + `Button` from shared UI library (Phase 1)
- Brass focus rings on inputs, red error borders
- PH market microcopy ("Set up your booking page")
- Responsive: centered card on desktop, full-width on mobile

---

## WHY

Auth pages are often the first interaction a user has. Generic Bootstrap-style cards look like a template, not a product. Branded auth pages signal that every screen was intentionally designed.

---

## KEY DECISIONS

| Decision | Rationale |
|----------|-----------|
| Use shared `Card`, `Input`, `Button` components | Consistency with rest of app; demonstrates component reuse |
| Keep existing form logic (react-hook-form + zod) | Don't rewrite working validation; only change presentation |
| Centered card on desktop, full-width on mobile | Standard auth pattern; works on all devices |

---

## OPEN QUESTIONS (for clarify step)

| # | Question | Options |
|---|----------|---------|
| Q1 | Should Register and RegisterBusiness share a common layout component? | Yes (shared `AuthLayout`) / No (separate) |
| Q2 | Should Profile page be in dashboard layout or standalone? | Dashboard layout (protected) / Standalone |

---

## ACCEPTANCE CRITERIA

- [ ] All 5 auth pages use shared `Card`, `Input`, `Button`
- [ ] Eyebrow + "Booked." wordmark on each page
- [ ] Brass focus rings on inputs; red error borders
- [ ] PH market microcopy included
- [ ] Responsive at 375px–1440px
- [ ] Impeccable audit passes on auth pages
- [ ] Existing form validation logic preserved
