# Appointment Booking System — Project Plan

## 🎯 Project Overview
**Stack:** ASP.NET Core 9 Web API + React 18 (TypeScript, Vite)  
**Target:** Clinics, salons, barbershops, massage spas in the Philippines  
**Goal:** Portfolio-ready, deployable to free tiers, demonstrates full-stack skills

---

## 🏗️ Architecture

```
booking-system/
├── Booking.Api/                    # ASP.NET Core Solution (Clean Architecture)
│   ├── src/
│   │   ├── Booking.Domain/         # Entities, Enums, Domain Events, Value Objects
│   │   ├── Booking.Application/    # Commands, Queries, Handlers, DTOs, Interfaces
│   │   ├── Booking.Infrastructure/ # EF Core, Repositories, Email/SMS, Auth, SignalR
│   │   └── Booking.Api/            # Controllers, Middleware, Program.cs, SignalR Hubs
│   └── tests/
│       ├── Booking.UnitTests/
│       └── Booking.IntegrationTests/
│
├── booking-client/                 # React + Vite + TypeScript
│   ├── src/
│   │   ├── features/               # Feature-based modules (booking, auth, dashboard)
│   │   ├── shared/                 # UI components, hooks, utilities, API client
│   │   ├── pages/                  # Route-level components
│   │   └── main.tsx
│   └── ...
│
├── docker-compose.yml              # Local dev: API, PostgreSQL, React (dev server)
├── .github/workflows/              # CI/CD pipelines
└── README.md
```

---

## 📦 Phase 1: Foundation (Week 1)

### 1.1 Initialize Repository & Solution Structure
```bash
# Create solution
dotnet new sln -n Booking

# Domain (no dependencies)
dotnet new classlib -n Booking.Domain -o src/Booking.Domain
dotnet sln add src/Booking.Domain

# Application (references Domain)
dotnet new classlib -n Booking.Application -o src/Booking.Application
dotnet add src/Booking.Application reference src/Booking.Domain
dotnet sln add src/Booking.Application

# Infrastructure (references Application, Domain)
dotnet new classlib -n Booking.Infrastructure -o src/Booking.Infrastructure
dotnet add src/Booking.Infrastructure reference src/Booking.Application
dotnet add src/Booking.Infrastructure reference src/Booking.Domain
dotnet sln add src/Booking.Infrastructure

# API (references all)
dotnet new webapi -n Booking.Api -o src/Booking.Api --controllers --use-minimal-apis false
dotnet add src/Booking.Api reference src/Booking.Application
dotnet add src/Booking.Api reference src/Booking.Infrastructure
dotnet add src/Booking.Api reference src/Booking.Domain
dotnet sln add src/Booking.Api

# Tests
dotnet new xunit -n Booking.UnitTests -o tests/Booking.UnitTests
dotnet add tests/Booking.UnitTests reference src/Booking.Domain
dotnet add tests/Booking.UnitTests reference src/Booking.Application
dotnet sln add tests/Booking.UnitTests

dotnet new xunit -n Booking.IntegrationTests -o tests/Booking.IntegrationTests
dotnet add tests/Booking.IntegrationTests reference src/Booking.Api
dotnet sln add tests/Booking.IntegrationTests
```

### 1.2 Install Core NuGet Packages
```bash
# Infrastructure
dotnet add src/Booking.Infrastructure package Microsoft.EntityFrameworkCore
dotnet add src/Booking.Infrastructure package Microsoft.EntityFrameworkCore.Design
dotnet add src/Booking.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add src/Booking.Infrastructure package Microsoft.AspNetCore.Identity.EntityFrameworkCore
dotnet add src/Booking.Infrastructure package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add src/Booking.Infrastructure package MediatR
dotnet add src/Booking.Infrastructure package FluentValidation
dotnet add src/Booking.Infrastructure package Mapster
dotnet add src/Booking.Infrastructure package Serilog.AspNetCore
dotnet add src/Booking.Infrastructure package Microsoft.AspNetCore.SignalR

# API
dotnet add src/Booking.Api package Microsoft.AspNetCore.OpenApi
dotnet add src/Booking.Api package Scalar.AspNetCore  # OpenAPI UI
dotnet add src/Booking.Api package AspNetCore.HealthChecks.UI.Client
dotnet add src/Booking.Api package AspNetCore.HealthChecks.NpgSql

# Tests
dotnet add tests/Booking.UnitTests package Moq
dotnet add tests/Booking.UnitTests package FluentAssertions
dotnet add tests/Booking.IntegrationTests package Microsoft.AspNetCore.Mvc.Testing
dotnet add tests/Booking.IntegrationTests package Testcontainers.PostgreSQL
dotnet add tests/Booking.IntegrationTests package Respawn
```

### 1.3 Create React Client
```bash
npm create vite@latest booking-client -- --template react-ts
cd booking-client
npm install

# Core deps
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install react-router-dom
npm install zod @hookform/resolvers react-hook-form
npm install axios
npm install @microsoft/signalr
npm install date-fns
npm install lucide-react  # icons

# Dev deps
npm install -D tailwindcss @tailwindcss/vite
npm install -D @types/react @types/react-dom
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks
npm install -D prettier prettier-plugin-tailwindcss
```

### 1.4 Configure Tailwind CSS (v4)
```css
/* booking-client/src/index.css */
@import "tailwindcss";
```

```ts
// booking-client/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### 1.5 Docker Compose for Local Development
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: booking
      POSTGRES_USER: booking
      POSTGRES_PASSWORD: booking
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U booking -d booking"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build:
      context: .
      dockerfile: src/Booking.Api/Dockerfile
    environment:
      ASPNETCORE_ENVIRONMENT: Development
      ConnectionStrings__DefaultConnection: "Host=postgres;Database=booking;Username=booking;Password=booking"
      Jwt__Key: "your-super-secret-key-at-least-32-chars-long"
      Jwt__Issuer: "Booking.Api"
      Jwt__Audience: "Booking.Client"
    ports:
      - "5000:8080"
    depends_on:
      postgres:
        condition: service_healthy

  client:
    build:
      context: ./booking-client
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./booking-client:/app
      - /app/node_modules
    environment:
      VITE_API_URL: http://localhost:5000
    depends_on:
      - api

volumes:
  pgdata:
```

### 1.6 GitHub Repository Setup
```bash
git init
git add .
git commit -m "chore: initial solution structure"
gh repo create booking-system --private --source=. --push
```

**Branch Strategy:**
- `main` — production-ready, protected
- `develop` — integration branch
- `feature/*` — feature branches from `develop`
- `fix/*` — bug fixes
- `release/*` — release preparation

---

## 🗄️ Phase 2: Database & Domain Model (Week 1)

### 2.1 Core Entities (Booking.Domain)
```csharp
// Business (multi-tenant ready)
Business, BusinessSettings

// Services & Staff
Service, ServiceCategory
Staff, StaffService (many-to-many)
StaffSchedule (weekly recurring), ScheduleOverride (date-specific)

// Customers & Bookings
Customer
Booking, BookingStatus (Pending, Confirmed, Cancelled, Completed, NoShow)
BookingService (service snapshot at booking time)

// Auth & Notifications
RefreshToken
Notification, NotificationChannel (Email, SMS, Push)
```

### 2.2 EF Core Configuration (Booking.Infrastructure)
- `BookingDbContext` with `DbSet<T>` for all entities
- Fluent API configurations in `IEntityTypeConfiguration<T>`
- PostgreSQL-specific: UUIDs, JSONB for settings, indexes
- Migrations: `dotnet ef migrations add InitialCreate -p src/Booking.Infrastructure -s src/Booking.Api`

### 2.3 Application Layer (Booking.Application)
- **CQRS with MediatR**: Commands/Queries + Handlers
- **DTOs**: Request/Response records
- **Validators**: FluentValidation for all commands
- **Mapping**: Mapster for Entity ↔ DTO
- **Interfaces**: `IEmailService`, `ISmsService`, `IDateTimeProvider`, `ICurrentUserService`

---

## 🔐 Phase 3: Authentication & Authorization (Week 1)

### 3.1 Identity Setup
- Extend `IdentityUser` → `ApplicationUser` (BusinessId, FullName, PhoneNumber)
- Roles: `Admin`, `Staff`, `Customer`
- JWT: Access token (15min) + Refresh token (7 days, rotated)
- Password hashing: ASP.NET Core Identity (PBKDF2)

### 3.2 Endpoints
```
POST   /api/auth/register           # Customer self-register
POST   /api/auth/login              # Returns access + refresh token
POST   /api/auth/refresh            # Rotate refresh token
POST   /api/auth/revoke             # Logout (revoke refresh token)
GET    /api/auth/me                 # Current user profile
PUT    /api/auth/me                 # Update profile
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### 3.3 Policies
```csharp
// Admin: full access to business
// Staff: read/write bookings, read services/schedules
// Customer: own bookings only
```

---

## 📅 Phase 4: Core Domain Features (Week 1-2)

### 4.1 Service Management (Admin/Staff)
```
GET    /api/services                    # List (paginated, filterable)
POST   /api/services                    # Create
GET    /api/services/{id}
PUT    /api/services/{id}
DELETE /api/services/{id}
```

### 4.2 Staff & Schedules
```
GET    /api/staff                       # List staff
POST   /api/staff
GET    /api/staff/{id}
PUT    /api/staff/{id}
DELETE /api/staff/{id}

GET    /api/staff/{id}/schedule         # Weekly schedule
PUT    /api/staff/{id}/schedule         # Update weekly schedule

GET    /api/staff/{id}/overrides        # Date overrides
POST   /api/staff/{id}/overrides        # Add time-off/extra hours
DELETE /api/staff/{id}/overrides/{overrideId}
```

### 4.3 Availability Engine (Core Algorithm)
```csharp
// Input: BusinessId, ServiceId, StaffId?, DateRange
// Output: Available time slots per day
// Logic:
// 1. Get staff schedules for date range
// 2. Apply overrides (time-off, extra hours)
// 3. Get existing bookings in range
// 4. Generate slots based on service duration
// 5. Exclude booked/blocked slots
// 6. Return: Date -> List<TimeSlot> { Start, End, StaffId, IsAvailable }
```

### 4.4 Booking Flow
```
# Public (Customer)
GET    /api/availability?serviceId=&date=&staffId=    # Get slots
POST   /api/bookings                                  # Create booking (guest or auth)
GET    /api/bookings/{id}/confirm/{token}             # Email confirmation

# Authenticated Customer
GET    /api/bookings/my-bookings
POST   /api/bookings/{id}/cancel
POST   /api/bookings/{id}/reschedule

# Staff/Admin
GET    /api/bookings                    # All (filter: date, status, staff)
GET    /api/bookings/calendar           # Calendar view data
PUT    /api/bookings/{id}/status        # Confirm, Complete, NoShow
POST   /api/bookings/{id}/reschedule    # Staff-initiated
```

---

## 🔔 Phase 5: Notifications & Real-time (Week 2)

### 5.1 Email (SendGrid / Resend / Mailgun)
- Booking confirmation
- 24hr reminder
- 1hr reminder
- Cancellation notice
- Staff assignment notification

### 5.2 SMS - Philippines (Semaphore / Vonage / Twilio)
- Same triggers as email
- Template: "Hi {Name}, your {Service} appointment is on {Date} at {Time}. Reply STOP to opt out."

### 5.3 SignalR Hubs
- `BookingHub` — Real-time calendar updates for staff/admin
- `NotificationHub` — Toast notifications for customers
- Groups: `business-{businessId}`, `staff-{staffId}`, `customer-{customerId}`

---

## 🎨 Phase 6: React Client (Week 2)

### 6.1 Project Structure
```
booking-client/src/
├── features/
│   ├── auth/           # Login, Register, ForgotPassword, Profile
│   ├── booking/        # PublicBookingWizard, MyBookings, BookingDetails
│   ├── dashboard/      # StaffCalendar, AdminDashboard, BusinessSettings
│   └── services/       # ServiceList, ServiceForm
├── shared/
│   ├── components/     # Button, Input, Modal, Calendar, Select, Table, Toast
│   ├── hooks/          # useAuth, useBookings, useAvailability, useSignalR
│   ├── api/            # axios instance, queryClient, API functions
│   ├── types/          # TypeScript interfaces (generated from OpenAPI?)
│   └── utils/          # date helpers, formatters, validators
├── pages/              # Route components
├── routes.tsx          # React Router config
├── main.tsx
└── App.tsx
```

### 6.2 Key Pages
| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/book/:businessSlug` | Public | Multi-step booking wizard |
| `/login`, `/register` | Public | Auth |
| `/my-bookings` | Customer | List + manage own bookings |
| `/dashboard` | Staff/Admin | Calendar, today's bookings, stats |
| `/admin/services` | Admin | Service CRUD |
| `/admin/staff` | Admin | Staff + schedules |
| `/admin/business` | Admin | Business settings |

### 6.3 TanStack Query Setup
```tsx
// shared/api/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

---

## ✅ Phase 7: Testing (Week 2-3)

### 7.1 Unit Tests (Booking.UnitTests)
- Domain logic: Availability engine, booking status transitions
- Application: Command/Query handlers, validators
- Target: >80% coverage on domain/application

### 7.2 Integration Tests (Booking.IntegrationTests)
- Testcontainers: PostgreSQL per test class
- Respawn: Database reset between tests
- Test: Auth flow, CRUD endpoints, booking logic, authorization

### 7.3 E2E (Optional - Playwright)
- Critical paths: Book → Confirm → Cancel
- Run in CI on PR

---

## 🚀 Phase 8: CI/CD & Deployment (Week 3)

### 8.1 GitHub Actions Workflows

#### `.github/workflows/ci.yml`
```yaml
name: CI
on: [push, pull_request]
jobs:
  build-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: booking_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U test -d booking_test"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with: { dotnet-version: '9.0.x' }
      - name: Restore
        run: dotnet restore Booking.sln
      - name: Build
        run: dotnet build Booking.sln --no-restore -c Release
      - name: Test
        run: dotnet test Booking.sln --no-build -c Release --logger "trx"
      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

#### `.github/workflows/cd-api.yml`
```yaml
name: Deploy API to Render
on:
  push:
    branches: [main]
    paths: ['src/Booking.Api/**', 'src/Booking.Infrastructure/**', 'src/Booking.Application/**', 'src/Booking.Domain/**']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Render
        uses: render/deploy-action@v1
        with:
          service-id: ${{ secrets.RENDER_API_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

#### `.github/workflows/cd-client.yml`
```yaml
name: Deploy Client to Vercel
on:
  push:
    branches: [main]
    paths: ['booking-client/**']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Node
        uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm', cache-dependency-path: 'booking-client/package-lock.json' }
      - name: Build
        run: |
          cd booking-client
          npm ci
          npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
        working-directory: ./booking-client
```

### 8.2 Environment Variables (Production)
| Variable | Render (API) | Vercel (Client) | Supabase/Neon (DB) |
|----------|--------------|-----------------|-------------------|
| `ConnectionStrings__DefaultConnection` | ✅ | | ✅ |
| `Jwt__Key`, `Jwt__Issuer`, `Jwt__Audience` | ✅ | | |
| `Email__ApiKey`, `Email__From` | ✅ | | |
| `Sms__Provider`, `Sms__ApiKey`, `Sms__From` | ✅ | | |
| `AllowedOrigins` | ✅ | | |
| `VITE_API_URL` | | ✅ | |

---

## 📚 Phase 9: Documentation & Polish (Week 3)

### 9.1 README.md
- Architecture diagram (Mermaid)
- Local setup (Docker Compose)
- Environment variables
- API documentation link (Scalar/OpenAPI)
- Deployment guide
- Screenshots/GIFs

### 9.2 API Documentation
- Scalar UI at `/openapi/v1.json` (configured in Program.cs)
- Example requests/responses

### 9.3 Portfolio Case Study
- Problem statement
- Tech stack & why
- Architecture decisions
- Challenges & solutions
- What you'd improve
- Live demo link + GitHub repo

---

## 🎯 What to Do First (Execution Order)

### **Day 1-2: Foundation**
1. ✅ Create GitHub repo (`booking-system`)
2. ✅ Scaffold .NET solution (4 projects + tests)
3. ✅ Scaffold React client (Vite + TS + Tailwind)
4. ✅ Add Docker Compose (Postgres + API + Client)
5. ✅ Verify: `docker compose up` → API at localhost:5000, Client at localhost:5173
6. ✅ Push to GitHub, enable branch protection on `main`

### **Day 3-4: Database & Auth**
7. ✅ Define Domain entities
8. ✅ Configure EF Core + create Initial migration
9. ✅ Implement Identity + JWT auth (register, login, refresh, me)
10. ✅ Write unit tests for auth logic

### **Day 5-7: Core Features**
11. ✅ Services CRUD + Staff + Schedules
12. ✅ **Availability Engine** (core algorithm — test thoroughly)
13. ✅ Booking flow (public + authenticated)
14. ✅ Admin/Staff dashboard endpoints

### **Day 8-10: Frontend**
15. ✅ TanStack Query + Axios setup
16. ✅ Auth pages (login, register, profile)
17. ✅ Public booking wizard (service → staff → date/time → confirm)
18. ✅ Customer "My Bookings" page
19. ✅ Staff calendar view (week/day) with SignalR

### **Day 11-12: Notifications & Polish**
20. ✅ Email service (SendGrid/Resend)
21. ✅ SMS service (Semaphore PH)
22. ✅ Booking reminders (background job / Hangfire or simple timer)
23. ✅ Responsive UI, loading states, error handling

### **Day 13-14: Deploy & Document**
24. ✅ Create Render account → PostgreSQL + Web Service
25. ✅ Create Vercel account → Import React repo
26. ✅ Configure GitHub Actions secrets
27. ✅ Push to `main` → watch deployments
28. ✅ Write README + case study
29. ✅ Record demo video/GIF
30. ✅ Add to portfolio

---

## 🛠️ Prerequisites (Install Before Starting)

| Tool | Version | Install |
|------|---------|---------|
| .NET SDK | 9.0 | `winget install Microsoft.DotNet.SDK.9` |
| Node.js | 20 LTS | `winget install OpenJS.NodeJS.LTS` |
| Docker Desktop | Latest | `winget install Docker.DockerDesktop` |
| GitHub CLI | Latest | `winget install GitHub.cli` |
| PostgreSQL Client (optional) | 16 | `winget install PostgreSQL.PostgreSQL` |
| VS Code / Rider | Latest | Your preference |

---

## 💡 Tips for Success

1. **Commit often** — Small, atomic commits with conventional messages
2. **Write tests as you go** — Don't leave all testing for the end
3. **Use `dotnet watch`** — Hot reload for API: `dotnet watch --project src/Booking.Api run`
4. **OpenAPI first** — Define DTOs, generate client types if needed
5. **Keep PRs small** — One feature per PR, easier to review
6. **Deploy early** — Get Render/Vercel working in Week 1, not Week 3
7. **Document decisions** — Add `docs/adr/` for Architecture Decision Records

---

## 📞 Support Resources

- **ASP.NET Core 9 Docs:** https://learn.microsoft.com/aspnet/core
- **EF Core Docs:** https://learn.microsoft.com/ef/core
- **React Query Docs:** https://tanstack.com/query
- **Tailwind CSS v4:** https://tailwindcss.com/docs
- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Philippines SMS APIs:**
  - Semaphore: https://semaphore.co/api-documentation/
  - Vonage: https://developer.vonage.com/messaging/sms/overview

---

*Generated on 2025-08-06 — Ready to start Phase 1?*