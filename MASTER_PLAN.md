# MASTER PLAN — Booked. Showcase-Ready Portfolio Transformation

**Project:** Booked. — Appointment Booking System  
**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS v4 / ASP.NET Core 9 + PostgreSQL 16  
**Goal:** Transform from "college project" appearance → professional portfolio showcase for company screening  
**Date:** Tue Nov 17 2026  
**Build Branch:** `develop` (all feature work happens here)  
**Staging:** `main` (protected, PRs only)

---

## 1. Branching Strategy (Updated)

```
main          — PROTECTED / STAGING. Never commit directly. PRs from develop only.
develop       — ACTIVE BUILD BRANCH. All feature branches checkout from here.
feat/*        — Feature branches from develop. PRs merge back to develop.
release/*     — PRODUCTION. Cut from main when stable.
```

**Workflow:**
1. `git checkout develop && git pull`
2. `git checkout -b feat/<feature-name>` (from develop)
3. Work on feature, commit with conventional messages
4. `git push origin feat/<feature-name>`
5. Open PR: `feat/<feature-name>` → `develop`
6. After review, merge to `develop`
7. When ready for release: PR `develop` → `main`

**Never:** commit directly to `main`, or checkout feature branches from `main`.

---

## 2. Phase Execution Plan (8 Phases, ~6 Days)

| Phase | Focus | Spec | Tasks |
|-------|-------|------|-------|
| 0 | Repo hygiene + README | ✅ Done (README on main) | — |
| 1 | Shared UI Component Library | `specs/003-ui-component-library/` | T001–T013 |
| 2 | Impeccable Design System Audit | `specs/004-impeccable-audit/` | T020–T029 |
| 3 | Landing Page Polish | `specs/005-landing-page-polish/` | T030–T043 |
| 4 | Auth Pages Branding | `specs/006-auth-pages-branding/` | T050–T057 |
| 5 | Dashboard & App Pages | `specs/007-dashboard-app-pages/` | T060–T068 |
| 6 | Booking Wizard Polish | `specs/008-booking-wizard-polish/` | T070–T078 |
| 7 | Responsive & Accessibility Polish | `specs/009-responsive-a11y-polish/` | T080–T087 |
| 8 | Demo Data, Deploy & Case Study | `specs/010-deploy-case-study/` | T090–T097 |

> **Note:** Specs 003-010 were removed during root cleanup to keep `main` clean. They will be recreated on `develop` as needed during execution.

---

## 3. Immediate Next Step

**Start Phase 1 — Shared UI Component Library** on `develop`:
- Create `booking-client/src/shared/ui/` directory
- Build `Button.tsx` (pilot component) with all 5 variants
- Verify against `.impeccable/design.json` tokens
- Build remaining 8 components
- Commit to feature branch, PR → `develop`

---

## 4. Execution Rules (from AGENTS.md)

- Never commit directly to `main` or `release/*`
- One feature slice per session
- Scaffold → generate → run tests → commit
- Domain has ZERO dependencies
- All timestamps stored in UTC, Asia/Manila conversion at boundary
- Auth/security code reviewed line by line

---

**End of MASTER PLAN**
