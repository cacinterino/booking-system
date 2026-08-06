## Description

<!-- What does this PR do? Why? Be specific. -->

## Type of Change

- [ ] ✨ **feat** — New feature
- [ ] 🐛 **bugfix** — Bug fix
- [ ] 🔨 **refactor** — Code change that neither fixes a bug nor adds a feature
- [ ] 📝 **docs** — Documentation only
- [ ] ⚙️ **chore** — Tooling, CI, dependencies, config
- [ ] 🚀 **release** — Release branch to production

## Branching Rules

- [ ] Branch name follows convention: `feat/<name>` / `bugfix/<name>` / `release/<version>`
- [ ] Target branch is `main` (staging) — **not** `release/*`
- [ ] No direct commits to `main` or `release/*`

## What Changed

- [ ] **API**: new/changed endpoint(s): `METHOD /api/...`
- [ ] **Client**: new/changed route(s): `/...`
- [ ] **Database**: new/updated migration
- [ ] **Infrastructure**: email/SMS/payment/service integration

## How to Test

<!-- Steps to verify locally. e.g. docker compose up, dotnet run, npm run dev -->

1. `docker compose up -d postgres`
2. `dotnet run --project src/Booking.Api`
3. `cd booking-client && npm run dev`
4. ...

## Tests

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] `dotnet test Booking.sln` passes
- [ ] `npm run build` passes (client)
- [ ] Availability engine changes → **tests required** (AGENTS.md Rule 1)

## Screenshots (if frontend change)

<!-- Drag and drop screenshots. Include mobile + desktop if responsive. -->

| Before | After |
|--------|-------|
|        |       |

## Environment Variables

<!-- List any new env vars and where they're set (Render/Vercel/Neon). See AGENTS.md table. -->

| Variable | Render (API) | Vercel (Client) | Neon (DB) |
|----------|--------------|-----------------|-----------|
|          |              |                 |           |

## Migration / Data Notes

<!-- Breaking changes? Data migration? Seed changes? -->

## Related

- Closes #
- Depends on #
