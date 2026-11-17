# Plan: Impeccable Design System Audit

## Stack Decisions

- **Audit Tool:** Impeccable design skill (`npx impeccable init` + `/impeccable audit`)
- **Design System Reference:** `.impeccable/design.json` + `DESIGN.md` + `booking-client/src/style.css`
- **Frontend Testing:** Vitest + React Testing Library (to be added)
- **No external UI library changes needed** — Phase 1 components are already built

## File Structure

```
specs/004-impeccable-audit/
├── spec.md
├── plan.md
├── tasks.md
└── checklists/
    └── requirements.md
```

## Audit Violations to Track

| Category | Rule | Violation Type |
|----------|------|----------------|
| Colors | Warm Paper Rule | Pure `#FFFFFF`, `bg-gray-100`, hardcoded hex |
| Colors | Rare Brass Rule | Brass >10% of screen |
| Typography | Eyebrow Rule | Missing mono brass eyebrow above headlines |
| Typography | Font pairing | Body in Fraunces, headlines in IBM Plex Sans |
| Elevation | Flat-By-Default Rule | Persistent shadows on resting surfaces |
| Shapes | Corner radii | Not 8/12/16 + pill only |
| Accessibility | Focus rings | Missing brass focus-visible rings |
| Accessibility | Reduced motion | Motion not disabled under `prefers-reduced-motion` |

## Departures from Design

None — this spec implements the committed design system exactly.

## Related Files

- `booking-client/src/style.css` — CSS custom properties
- `.impeccable/design.json` — Design system spec
- `DESIGN.md` — Design rules and rationale
- `booking-client/src/shared/ui/` — Phase 1 components (audit these too)
