# Plan: Auth Pages Branding

## File Changes

| File | Changes |
|------|---------|
| `booking-client/src/features/auth/pages/LoginPage.tsx` | Add eyebrow, use Card/Input/Button, brass focus rings |
| `booking-client/src/features/auth/pages/RegisterPage.tsx` | Add eyebrow, use Card/Input/Button, brass focus rings |
| `booking-client/src/features/auth/pages/RegisterBusinessPage.tsx` | Add eyebrow, use Card/Input/Button, brass focus rings |
| `booking-client/src/features/auth/pages/AcceptInvitationPage.tsx` | Add eyebrow, use Card/Input/Button, brass focus rings |
| `booking-client/src/features/auth/pages/ProfilePage.tsx` | Add eyebrow, use Card/Input/Button, brass focus rings |

## Design Token Mapping

| Element | CSS Var | Usage |
|---------|---------|-------|
| Background | `--color-paper` | `#F5F0E4` — page background |
| Card surface | `--color-paper-white` | `#FFFDF8` — card surface |
| Primary text | `--color-ink` | `#14213D` — headlines |
| Secondary text | `--color-ink-soft` | `#233258` — labels |
| Accent | `--color-brass` | `#B8862B` — focus rings, wordmark period |
| Soft accent | `--color-brass-soft` | `#D8AE5F` — hover |
| Muted text | `--color-slate` | `#5B6270` — placeholders |
| Border | `--color-line` | `rgba(20,33,61,0.14)` — hairline |
| Display font | `--font-display` | `Fraunces, serif` — "Booked." wordmark |
| Body font | `--font-sans` | `IBM Plex Sans, sans-serif` — body copy |
| Mono font | `--font-mono` | `IBM Plex Mono, monospace` — eyebrows |

## Departures from Design

None — this spec implements the committed design system exactly.

## Related Files

- `booking-client/src/shared/ui/Button.tsx` — Phase 1 Button component
- `booking-client/src/shared/ui/Input.tsx` — Phase 1 Input component
- `booking-client/src/shared/ui/Card.tsx` — Phase 1 Card component
- `.impeccable/design.json` — Design system spec
- `DESIGN.md` — Design rules and rationale
