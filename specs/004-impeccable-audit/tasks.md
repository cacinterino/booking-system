# Tasks: Impeccable Design System Audit

**Spec:** `specs/004-impeccable-audit/spec.md`  
**Plan:** `specs/004-impeccable-audit/plan.md`

| ID | Task | Status | Depends On |
|----|------|--------|------------|
| T020 | Run `npx impeccable init` on `booking-client/` | In Progress | — |
| T021 | Run Impeccable audit against `booking-client/src` | Pending | T020 |
| T022 | Catalogue all violations (file, line, rule, severity) | Pending | T021 |
| T023 | Fix color violations: replace hardcoded hex with CSS vars | Pending | T022 |
| T024 | Fix typography violations: Fraunces display / IBM Plex Sans body / Mono labels | Pending | T022 |
| T025 | Fix elevation violations: remove persistent shadows, add hover-only shadows | Pending | T022 |
| T026 | Fix corner radius violations: 8/12/16 + pill only | Pending | T022 |
| T027 | Fix eyebrow violations: add uppercase mono brass above headlines | Pending | T022 |
| T028 | Fix brass coverage violations: ensure brass ≤10% per screen | Pending | T022 |
| T029 | Add frontend unit tests (Vitest + React Testing Library) | Pending | T020 |
| T030 | Re-run audit; confirm zero violations or justified exceptions | Pending | T023–T029 |
