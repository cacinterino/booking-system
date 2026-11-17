# Booked.

> Real-time, conflict-free appointment booking for Philippine service businesses — clinics, salons, barbershops, and spas.

[![ASP.NET Core 9](https://img.shields.io/badge/API-ASP.NET%20Core%209-512BD8?logo=dotnet)](https://dotnet.microsoft.com/)
[![React 18](https://img.shields.io/badge/Client-React%2018-61DAFB?logo=react)](https://reactjs.org/)
[![PostgreSQL 16](https://img.shields.io/badge/DB-PostgreSQL%2016-336791?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Styling-Tailwind%20v4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

**Live Demo:** [Coming Soon — Render + Vercel]  
**Repo:** [github.com/cacinterino/booking-system](https://github.com/cacinterino/booking-system)

---

## 🎯 The Pitch

Small service businesses in the Philippines still run on phone calls, walk-ins, and paper diaries. No-shows kill revenue. Double-bookings destroy trust.

**Booked.** replaces all of that with a real-time booking platform where customers pick a real, available slot, pay a small deposit with GCash or Maya, and get automated reminders so they actually show up.

Built as a portfolio-grade, production-ready full-stack application with Clean Architecture, CQRS, a tested availability engine, and database-level double-booking prevention.

---

## 📸 Screenshots

| Landing Page | Booking Wizard | Staff Dashboard |
|--------------|---------------|-----------------|
| _(add)_ | _(add)_ | _(add)_ |

> Record a 60-second demo GIF and drop it here before sharing the link with recruiters.

---

## 🚀 Features

### For Business Owners & Staff
- **Service management** — Create, edit, deactivate services with pricing and duration
- **Team management** — Invite staff, assign services, set weekly schedules
- **Schedule overrides** — Date-specific time-off or extra hours
- **Calendar view** — See today's and upcoming bookings at a glance
- **Booking lifecycle** — Confirm, complete, mark no-show, cancel, reschedule
- **Real-time updates** — SignalR pushes calendar changes live

### For Customers (Guests + Registered)
- **Public booking page** — Share a link (`/book/:businessSlug`), no app download
- **Real-time availability** — Slots computed from staff schedules, overrides, and existing bookings
- **GCash & Maya deposits** — PayMongo-powered deposits to hold slots and cut no-shows
- **Access code management** — View, reschedule, or cancel bookings with a code
- **Email/SMS reminders** — 24h and 1h before each appointment

### Platform Guarantees
- **No double-bookings** — Postgres exclusion constraint on `(StaffId, StartTime)`; exactly one winner, clean 409 for the loser
- **Idempotent booking creates** — `Idempotency-Key` header prevents duplicate submissions
- **Asia/Manila timezone** — All timestamps stored in UTC, converted at the API boundary
- **Soft delete** — `IsDeleted` + global query filter on `Booking` and `Customer`

---

## 🏗️ Architecture

Clean Architecture with CQRS via MediatR. Domain has **zero dependencies** — no EF Core, no MediatR, no external packages.

```
booking-system/
├── Booking.Api/                    # Controllers, Middleware, Program.cs, SignalR Hubs
│   └── src/
│       ├── Booking.Domain/         # Entities, Enums, Domain Events, Value Objects (ZERO deps)
│       ├── Booking.Application/    # Commands, Queries, Handlers, DTOs, Interfaces
│       ├── Booking.Infrastructure/ # EF Core, Repositories, Email/SMS, Auth, SignalR
│       └── Booking.Api/            # ASP.NET Core 9 Web API
└── booking-client/                 # React 18 + TypeScript + Vite + Tailwind CSS v4
    ├── src/
    │   ├── features/               # Feature-based modules (booking, auth, dashboard)
    │   ├── shared/                 # UI components, hooks, utilities, API client
    │   ├── pages/                  # Route-level components
    │   └── main.tsx
```

**Key design decisions:**
- **Exclusion constraint** instead of application-level locking for double-booking prevention (database is the final authority)
- **UTC storage** + Asia/Manila conversion at DTO mapping boundary
- **TanStack Query** for server state on the client
- **React Hook Form + Zod** for form validation
- **Impeccable design system** for UI consistency (audited against committed design tokens)

---

## 🛠️ Local Setup

### Prerequisites
| Tool | Version |
|------|---------|
| .NET SDK | 9.0 |
| Node.js | 20 LTS |
| Docker Desktop | Latest |
| GitHub CLI | Latest |

### 1. Clone the repo
```bash
git clone https://github.com/cacinterino/booking-system.git
cd booking-system
```

### 2. Start the stack (API + Postgres + pgAdmin)
```bash
docker compose up -d
```

### 3. Run EF Core migrations
```bash
dotnet ef database update --project src/Booking.Infrastructure --startup-project src/Booking.Api
```

### 4. Seed demo data (optional but recommended for demos)
```bash
dotnet run --project src/Booking.Api -- --seed
```

### 5. Start the API
```bash
dotnet run --project src/Booking.Api
# API: http://localhost:5000
```

### 6. Start the client
```bash
cd booking-client
npm install
npm run dev          # http://localhost:5173
```

### 7. Run tests
```bash
dotnet test Booking.sln
```

---

## 🔐 Environment Variables

| Variable | Render (API) | Vercel (Client) | Description |
|----------|-------------|-----------------|-------------|
| `ConnectionStrings__DefaultConnection` | ✅ | | PostgreSQL connection string |
| `Jwt__Key` | ✅ | | JWT signing key (min 32 chars) |
| `Jwt__Issuer` | ✅ | | JWT issuer |
| `Jwt__Audience` | ✅ | | JWT audience |
| `Email__ApiKey` | ✅ | | Email provider API key |
| `Email__From` | ✅ | | From address |
| `Sms__Provider` | ✅ | | `semaphore` for PH |
| `Sms__ApiKey` | ✅ | | SMS provider API key |
| `Sms__From` | ✅ | | SMS sender ID |
| `PayMongo__SecretKey` | ✅ | | PayMongo secret key (deposits) |
| `AllowedOrigins` | ✅ | | CORS origins (client domain) |
| `VITE_API_URL` | | ✅ | API base URL for client |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Customer self-register |
| `POST` | `/api/auth/login` | Public | Returns access + refresh token |
| `POST` | `/api/auth/refresh` | Auth | Rotate refresh token |
| `POST` | `/api/auth/revoke` | Auth | Logout |
| `GET` | `/api/auth/me` | Auth | Current user profile |

### Services (Admin)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/services` | Admin/Staff | List services |
| `POST` | `/api/services` | Admin | Create service |
| `PUT` | `/api/services/{id}` | Admin | Update service |
| `DELETE` | `/api/services/{id}` | Admin | Delete service |

### Staff & Schedules (Admin)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/staff` | Admin | List staff |
| `POST` | `/api/staff` | Admin | Create staff |
| `GET` | `/api/staff/{id}/schedule` | Admin/Staff | Weekly schedule |
| `PUT` | `/api/staff/{id}/schedule` | Admin | Update schedule |
| `POST` | `/api/staff/{id}/overrides` | Admin | Add override |

### Booking (Customer + Staff)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/availability` | Public | Available slots |
| `POST` | `/api/bookings` | Public/Auth | Create booking (idempotent) |
| `GET` | `/api/bookings/my-bookings` | Customer | My bookings |
| `POST` | `/api/bookings/{id}/cancel` | Customer/Owner | Cancel booking |
| `POST` | `/api/bookings/{id}/reschedule` | Customer/Owner/Staff | Reschedule |
| `GET` | `/api/bookings/calendar` | Staff/Admin | Calendar events |
| `PUT` | `/api/bookings/{id}/status` | Staff | Confirm/Complete/NoShow |

---

## 🧪 Testing

| Suite | Framework | Count | Status |
|-------|-----------|-------|--------|
| Unit tests | xUnit + Moq + FluentAssertions | 45 passing | ✅ |
| Integration tests | Testcontainers + Respawn | 7 passing | ✅ |

**Key test coverage:** availability engine, concurrency race (two simultaneous bookings → one 201, one 409), booking lifecycle, auth flow.

```bash
dotnet test Booking.sln
```

---

## 🇵🇭 Data Privacy (RA 10173)

Booked. collects customer personal information (name, email, phone) for the purpose of appointment booking and reminders.

- **What we collect:** Name, email, phone (optional), booking details
- **Why:** To confirm appointments, send reminders, and manage bookings
- **How stored:** PostgreSQL 16, encrypted at rest via hosting provider, access-controlled
- **Retention:** Booking records retained for business operations; soft-deleted records kept for audit trail
- **Rights:** Customers may request access, correction, or deletion of their data

This system is designed with RA 10173 (Data Privacy Act of the Philippines) awareness.

---

## 🚀 Deployment

| Layer | Provider | Tier |
|-------|----------|------|
| Database | Neon / Supabase | Free (permanent) |
| API | Render | Paid (avoid cold starts for demos) |
| Client | Vercel | Free |

**CI/CD:** GitHub Actions → Render (API) + Vercel (Client)

### Pre-deploy checklist
- [ ] `GET /api/health` endpoint + PostgreSQL health check
- [ ] Auto-run EF migrations on startup or Render release command
- [ ] Seed script (`dotnet run --seed`) — so the calendar isn't empty
- [ ] CORS `AllowedOrigins` points at the real Vercel domain
- [ ] Rate limiting on `/api/auth/login` and `POST /api/bookings`
- [ ] GitHub Actions secrets set: `RENDER_API_KEY`, `VERCEL_TOKEN`, etc.

---

## 📚 Case Study

See `docs/CASE_STUDY.md` for the full portfolio write-up: problem statement, tech stack rationale, architecture decisions, challenges solved (double-booking, timezone edge cases), and what you'd improve.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional messages: `git commit -m "feat: add ..."`
4. Open a PR to `main` (never commit directly to `main`)

---

## 📄 License

MIT License. Built for the Philippines service market.

---

**Booked.** — Appointments booked. No-shows cancelled.