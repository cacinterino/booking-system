# Spec: Impeccable Design System Audit

**Feature:** Run Impeccable design audit against `booking-client/src` and fix all violations against `DESIGN.md` / `.impeccable/design.json`
**Phase:** 2 of Showcase Readiness Plan  
**Status:** In Progress  
**Branch:** `feat/impeccable-audit` (from `develop`)

---

## WHAT

Run the Impeccable design skill audit against the React client to detect every violation of the committed design system, then fix each violation until the audit is clean.

**Audit checks:**
- Colors: surfaces use `paper`/`paper-white`/`ink`, never pure white/gray
- Brass ≤10% per screen (Rare Brass Rule)
- Eyebrows above headlines (Eyebrow Rule)
- Typography: Fraunces display / IBM Plex Sans body / IBM Plex Mono labels
- Flat-by-default elevation (shadows only on interaction)
- Corner radii: 8/12/16 + pill only
- Focus rings, AA contrast, `prefers-reduced-motion` support

---

## WHY

The design system exists (`DESIGN.md`, `.impeccable/design.json`, `style.css`) but has never been audited. Pages currently violate the system in small ways that accumulate into a "college project" appearance. A clean Impeccable audit is the objective measure that the UI is professional and consistent.

---

## KEY DECISIONS

| Decision | Rationale |
|----------|-----------|
| Fix all violations, don't suppress unless justified by `DESIGN.md` | The `.impeccable/config.json` already has justified suppressions; new violations should be fixed, not hidden |
| Audit after Phase 1 (UI library) is built | New components must be audit-clean from the start |
| Re-audit after each subsequent phase | Prevents regression as pages are modified |

---

## OPEN QUESTIONS (for clarify step)

| # | Question | Options |
|---|----------|---------|
| Q1 | Which pages have the most violations? | To be determined by audit run |
| Q2 | Are there intentional design deviations that should be documented? | Yes (document as exceptions) / No (fix all) |

---

## ACCEPTANCE CRITERIA

- [ ] `npx impeccable init` run on `booking-client/`
- [ ] Impeccable audit executed against `booking-client/src`
- [ ] All violations catalogued with file/line references
- [ ] All fixable violations resolved
- [ ] Remaining violations documented as justified exceptions (if any)
- [ ] Final audit run shows clean result
- [ ] Frontend unit tests added (Vitest + React Testing Library)
