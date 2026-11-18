# Spec: Responsive & Accessibility Polish

**Feature:** Production-grade responsive design and accessibility refinements across all pages
**Phase:** 7 of Showcase Readiness Plan  
**Status:** In Progress  
**Branch:** `feat/responsive-a11y-polish` (from `develop`)

## WHAT

Add production-grade details: responsive breakpoints, focus rings, reduced motion support, loading skeletons, error states, empty states.

## KEY DECISIONS

Test at 375px, 768px, 1024px, 1440px. Brass focus-visible rings. prefers-reduced-motion from style.css.

## ACCEPTANCE CRITERIA

- All pages tested at 375px, 768px, 1024px, 1440px
- prefers-reduced-motion disables float/marquee animations
- Brass focus-visible rings on all interactive elements
- No animate-pulse boxes remain
- Consistent error banners + inline field errors
- EmptyState on all no-data screens
- Impeccable audit passes (final run)
