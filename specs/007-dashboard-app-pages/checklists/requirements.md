# Requirements Checklist: Dashboard & App Pages

**Spec:** `specs/007-dashboard-app-pages/spec.md`

- [x] **Eyebrow Rule**: Every page and primary section has an uppercase monospace brass eyebrow (`text-brass-deep font-mono tracking-widest text-xs uppercase`).
- [x] **Editorial Typography**: Page titles and section headings use Fraunces serif (`font-display font-bold text-ink`).
- [x] **Color Palette**: Backgrounds use warm paper (`bg-paper`), containers use soft ivory (`bg-paper-white`), borders use hairline lines (`border-line`).
- [x] **Rare Brass**: Brass is reserved for primary CTAs, active highlights, and decorative touches (<= 10% screen space).
- [x] **Component Reusability**: All app pages utilize the shared components in `src/shared/ui` (`Card`, `Button`, `Badge`, `Input`, `Modal`, `EmptyState`, `LoadingSkeleton`, `SectionHeader`).
- [x] **Philippine Market Formatting**: Prices display in PHP (`₱`) and dates/times are presented in Manila timezone context.
- [x] **Zero Compilation Errors**: TypeScript checks pass with zero errors.
