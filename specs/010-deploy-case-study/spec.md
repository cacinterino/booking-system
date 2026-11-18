# Spec: Demo Data, Deploy & Case Study

**Feature:** Seed demo data, deploy to Render + Vercel, record demo, write case study
**Phase:** 8 of Showcase Readiness Plan  
**Status:** In Progress  
**Branch:** `feat/demo-deploy-case-study` (from `develop`)

## WHAT

Make the live demo ready for a screener to click and see a working application with data.

**Tasks:**

| Area | Task |
|------|------|
| Seed data | `dotnet run --seed`: services, staff, schedules, demo bookings, demo admin account |
| Deploy API | Render (paid tier to avoid cold starts) |
| Deploy Client | Vercel (free) |
| Pre-deploy checklist | Health endpoint, auto-migrations, CORS, rate limiting |
| Demo video/GIF | Record 60-second demo for README |
| Case study | `docs/CASE_STUDY.md`: problem, stack, decisions, challenges, improvements |

## KEY DECISIONS

Render paid tier for API demo (free tier spins down after inactivity). Vercel free tier for client. Neon/Supabase for DB (permanent free tier).

## ACCEPTANCE CRITERIA

- Seed script creates services, staff, schedules, demo bookings, demo admin
- API deployed to Render with health endpoint
- Client deployed to Vercel
- CORS points at real Vercel domain
- Rate limiting on `/api/auth/login` and `POST /api/bookings`
- Demo video/GIF recorded and embedded in README
- `docs/CASE_STUDY.md` written
- Live demo URL added to README
