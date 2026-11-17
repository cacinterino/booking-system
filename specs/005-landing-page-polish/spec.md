# Spec: Landing Page Polish

**Feature:** Modularize `LandingPage.tsx` (605 lines) into design-system-compliant components and polish visual execution
**Phase:** 3 of Showcase Readiness Plan  
**Status:** In Progress  
**Branch:** `feat/landing-page-polish` (from `develop`)

---

## WHAT

Break the monolithic `LandingPage.tsx` into focused components and apply the `Booked.` design system rigorously.

**Components to extract:**

| Component | File | Purpose |
|-----------|------|---------|
| `Navbar` | `LandingPage/components/Navbar.tsx` | Translucent header with wordmark + CTA |
| `Hero` | `LandingPage/components/Hero.tsx` | Hero section with headline, CTA, visual |
| `HeroVisual` | `LandingPage/components/HeroVisual.tsx` | Ticket mockup + floating elements |
| `StatStrip` | `LandingPage/components/StatStrip.tsx` | 4-stat grid section |
| `PurposeSection` | `LandingPage/components/PurposeSection.tsx` | "Why Booked." section |
| `FeaturesGrid` | `LandingPage/components/FeaturesGrid.tsx` | 6 feature cards |
| `Marquee` | `LandingPage/components/Marquee.tsx` | Use cases scrolling strip |
| `Testimonials` | `LandingPage/components/Testimonials.tsx` | Customer quotes (placeholder → honest) |
| `CtaSection` | `LandingPage/components/CtaSection.tsx` | Final call-to-action |
| `Footer` | `LandingPage/components/Footer.tsx` | Site footer with links |

**Design system rigor:**
- Eyebrow above every section headline
- Warm Paper background, Soft Ivory cards
- Brass sparingly (CTA buttons, stamps, active states)
- Ticket component for hero mockup

---

## WHY

A 605-line single file is hard to maintain and signals a student project. Modular, component-based structure signals professional engineering. Design system compliance signals attention to detail.

---

## KEY DECISIONS

| Decision | Rationale |
|----------|-----------|
| Components live in `pages/LandingPage/components/` (co-located) | Keeps landing-specific components together; shared components go in `shared/ui/` |
| Testimonials: honest placeholder | `PRODUCT.md` says testimonials are placeholders — don't fake evidence |
| Keep framer-motion animations | Already configured; refine timing for polish |

---

## OPEN QUESTIONS (for clarify step)

| # | Question | Options |
|---|----------|---------|
| Q1 | Should testimonials section be removed until real testimonials exist? | Remove / Keep with honest placeholder |
| Q2 | Should `HeroVisual` ticket mockup use the shared `Ticket` component? | Yes / No (keep inline) |

---

## ACCEPTANCE CRITERIA

- [ ] `LandingPage.tsx` reduced to <200 lines (orchestration only)
- [ ] All 10 component files created in `pages/LandingPage/components/`
- [ ] Eyebrow above every section headline
- [ ] Warm Paper background, Soft Ivory cards
- [ ] Brass ≤10% of screen
- [ ] Impeccable audit passes on landing components
- [ ] Mobile responsive at 375px–768px
- [ ] framer-motion animations preserved with refined timing
