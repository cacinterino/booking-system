# Plan: Landing Page Polish

## File Structure

```
booking-client/src/pages/LandingPage/
├── LandingPage.tsx          (<200 lines, orchestration only)
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── HeroVisual.tsx
│   ├── StatStrip.tsx
│   ├── PurposeSection.tsx
│   ├── FeaturesGrid.tsx
│   ├── Marquee.tsx
│   ├── Testimonials.tsx
│   ├── CtaSection.tsx
│   └── Footer.tsx
```

## Design Token Mapping

| Element | CSS Var | Usage |
|---------|---------|-------|
| Background | `--color-paper` | `#F5F0E4` — page background |
| Card surface | `--color-paper-white` | `#FFFDF8` — cards, inputs |
| Primary text | `--color-ink` | `#14213D` — headlines |
| Secondary text | `--color-ink-soft` | `#233258` — labels |
| Accent | `--color-brass` | `#B8862B` — CTA, stamps (≤10%) |
| Soft accent | `--color-brass-soft` | `#D8AE5F` — hover |
| Muted text | `--color-slate` | `#5B6270` — placeholders |
| Border | `--color-line` | `rgba(20,33,61,0.14)` — hairline |
| Display font | `--font-display` | `Fraunces, serif` |
| Body font | `--font-sans` | `IBM Plex Sans, sans-serif` |
| Mono font | `--font-mono` | `IBM Plex Mono, monospace` |

## Departures from Design

None — this spec implements the committed design system exactly.

## Related Files

- `booking-client/src/pages/LandingPage.tsx` — current 605-line monolith
- `booking-client/src/shared/ui/` — Phase 1 components (Button, Card, Ticket, Badge, SectionHeader)
- `.impeccable/design.json` — Design system spec
- `DESIGN.md` — Design rules and rationale
