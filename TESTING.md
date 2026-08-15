# Booked. — Full Test Guide

How to verify every scenario in the appointment booking system end-to-end.
Covers the Docker stack, automated tests, manual UI flows, API smoke tests, and
the availability/concurrency edge cases the project protects.

---

## 1. Prerequisites & Starting the Stack

Requirements:

- **Docker Desktop** (running) — runs Postgres, the API, and the client.
- **.NET 9 SDK** — for `dotnet test` (only needed for automated tests).
- **Node 20+** — only needed if you run the client outside Docker.

Start everything:

```powershell
docker compose up -d
```

| Service | URL / port | Login |
|---|---|---|
| Client (React) | http://localhost:5173 | — |
| API (Swagger) | http://localhost:5000/swagger | — |
| pgAdmin | http://localhost:5050 | `admin@local.dev` / `admin` |
| Postgres | `localhost:5432` | `booking` / `booking` / db `booking` |

Migrations run automatically on API startup. Check health:

```powershell
docker compose ps
```

> **Known dev quirk:** the Vite dev server sometimes serves stale code after a
> file edit (HMR bug). If a UI change doesn't appear, restart the client:
> `docker compose restart client`, then wait ~8s and refresh.

### Test data

There is no automated seeder. Use one of these:

1. **Reuse the smoke business** (already in the local DB):
   - Owner login: `owner9436@smoke.dev` / `Passw0rd!x`
   - Booking link: http://localhost:5173/book/smoke-clinic-9436
   - Seed staff: "Mark Staff" · Seed customer: "Sally Owner"
2. **Create fresh data** — follow the flows in §3 to build a business from scratch.

---

## 2. Automated Tests

Run the whole suite from the repo root:

```powershell
dotnet test Booking.sln
```

- **`tests/Booking.UnitTests`** — availability engine, booking command/query
  handlers, staff/service command handlers, validators, validation pipeline,
  public business query, public staff mapper. No Docker needed.
- **`tests/Booking.IntegrationTests`** — spins up a disposable Postgres via
  Testcontainers (Docker must be running), applies real migrations, and drives
  the real API via `WebApplicationFactory`:
  - `BookingLifecycleTests` — book → confirm by access code → cancel → slot freed.
  - `BookingConcurrencyTests` — two parallel bookings for the same slot:
    **exactly one 201, one 409, never a 500**.
  - `BookingStaffTests` — staff calendar visibility + status changes.

Run a single project:

```powershell
dotnet test tests/Booking.UnitTests/Booking.UnitTests.csproj
dotnet test tests/Booking.IntegrationTests/Booking.IntegrationTests.csproj
```

---

## 3. Manual UI Flows

### 3.1 Owner onboarding (register a business)

1. Open http://localhost:5173/register-business
2. Enter a business name (a slug is auto-generated; keep it), your name, email,
   a phone, and a strong password (twice).
3. Submit → you land on `/staff/calendar` signed in as the **owner/admin**.
4. Verify you can see the dashboard nav (Dashboard, Calendar, Services, Staff).

**Negative:** submit with mismatched passwords → inline error, no request sent.
Duplicate email → server error message shown.

### 3.2 Publish services (admin)

1. Navigate to `/admin/services` (from the nav).
2. Create a category if none exist (e.g. "Consultation").
3. Add a service: name, price (PHP), duration, category, **active**.
4. It appears immediately in the list.

**Negative:** save with blank name or 0/negative price → validation error, 400.

### 3.3 Add staff + set a schedule (admin)

1. Navigate to `/admin/staff`.
2. **Add staff** → name, email, phone, assign the service(s) you created.
3. On the new staff card click **Schedule** → toggle some weekdays to working,
   set start/end times (e.g. Mon–Fri 09:00–17:00) → **Save**.
4. Click **Overrides** on a staff card → add a "time off" override for a day
   and save, then remove it.

**Negative:** a staff member with **no schedule** should produce **no slots**
(see §4.4). A schedule with end ≤ start should be rejected.

### 3.4 Guest booking wizard (public, anonymous)

Open the public booking link with the business slug, e.g.:

```
http://localhost:5173/book/smoke-clinic-9436
```

1. **Step 1 — Service:** pick a service.
2. **Step 2 — Staff:** pick a staff member who offers that service.
3. **Step 3 — Date & time:** pick a date within the advance-booking window, then
   a slot. Slots group by staff and show "N open slots".
4. **Step 4 — Details:** name, email, phone (optional), notes (optional) → confirm.
5. **Confirmation:** you see "See you there", the **access code** (copy it),
   booking reference, and total. Keep the access code — it's your only way back.

**Negative / edge cases:**
- Bad slug → "We couldn't find that business" page (not a crash).
- Business with no active services → "No services available yet".
- Fully-booked date → "This date is fully booked. Try another date."
- Double submit → second submit is a no-op (idempotency key).
- Book the *same* slot from two browsers → second one gets "That slot just got
  taken" and is offered fresh times (see §5).

### 3.5 Customer self-service via access code

1. Open http://localhost:5173/my-bookings
2. Enter the access code from §3.4 (optionally tick "Remember this device").
3. **Upcoming** shows the booking card with **Reschedule** and **Cancel** actions.
4. **Reschedule** → pick a new time → Confirm → card updates; the old slot is freed.
5. **Cancel** → optional reason → Cancel → booking moves to **Past** and the slot
   is released for others.
6. "Use a different access code" clears the code.

**Negative:** wrong/unknown code → "We couldn't load your bookings" with a
"Enter a different code" option.

### 3.6 Staff calendar + status changes

1. Log in as an invited staff member (or the owner) → `/staff/calendar`.
2. Week grid shows each day's booking count; click a day to load that day.
3. Click a booking → **update status** (confirmed / completed / no-show /
   cancelled). The chip updates on the card.
4. Staff only sees their own calendar; the owner/admin sees everyone.

### 3.7 Invite a staff member (admin)

1. On `/admin/staff`, **Add staff** → the system creates the staff record.
2. Owner invites: `POST /api/business/{businessId}/invitations` (or via the
   invite UI) → a `[DEV] Invitation for …` line is **printed to the API logs**
   because SendGrid isn't configured:
   ```powershell
   docker compose logs api | Select-String "Invitation"
   ```
3. Open the printed `/accept-invitation?token=…` link in a **fresh/private
   window**, set a password → you land on `/staff/calendar` as a staff member.

**Negative:** expired or reused token → "Invitation is invalid or has expired".
Accepting with a different email than the invite → rejection.

### 3.8 Signed-in customer dashboard

1. Register a plain customer at `/register`, or log in as "Sally Owner".
2. `/dashboard` shows customer stats. `/profile` shows the account page.
3. `/my-bookings` greets the signed-in customer by name and lists their bookings
   with no access code needed.

---

## 4. API Smoke Tests (PowerShell)

All commands assume the stack is up. Replace values as needed.

### 4.1 Resolve a business by slug

```powershell
$slug = "smoke-clinic-9436"
Invoke-RestMethod -Uri "http://localhost:5000/api/public/businesses/$slug"
```
Expect `name`, `slug`, `timezone=Asia/Manila`, `requireDeposit`, `depositAmount`,
`currency`, `advanceBookingDays`, `slotIntervalMinutes`.
Unknown slug → 404 `Business not found`.

### 4.2 List public services + staff (PII stripped)

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/public/businesses/$slug/services"
Invoke-RestMethod -Uri "http://localhost:5000/api/public/businesses/$slug/staff"
```
Staff items must expose **only** `fullName` + `serviceIds` — assert there is no
`email`, `phone`, or `avatarUrl` property (RA 10173 / privacy).

### 4.3 Query availability

```powershell
$serviceId = "<id from §4.2>"
$date = (Get-Date).Date.AddDays(1).ToString("yyyy-MM-dd")
Invoke-RestMethod -Uri "http://localhost:5000/api/public/businesses/$slug/availability?serviceId=$serviceId&date=$date"
```
Each slot has Manila `start`/`end` and UTC `startUtc`/`endUtc` (exactly 8h
apart). An empty day → `slots: []` with **200** (not an error).

### 4.4 Availability engine edge cases

Verify each against the correct business/staff:

- **No schedules:** staff with no weekly schedule → no slots.
- **Time-off override:** override "removes" a working day → no slots that day.
- **Extra availability:** override that adds time → extra slots appear.
- **Fully booked:** existing bookings for all slots → empty `slots`.
- **Midnight edge:** a booking ending at 23:59 does not leak into the next day.

### 4.5 Book a slot (201) with idempotency

```powershell
$slot = (Invoke-RestMethod -Uri "http://localhost:5000/api/public/businesses/$slug/availability?serviceId=$serviceId&date=$date").slots[0]
$body = @{
  businessId = "<businessId from §4.1>"
  serviceId  = $serviceId
  staffId    = $slot.staffId
  startTime  = $slot.startUtc          # UTC ISO — never a Manila string
  notes      = "smoke test"
  guestContact = @{ name = "QA Guest"; email = "qa@example.com"; phone = "09171234567" }
} | ConvertTo-Json -Depth 4
$key = [guid]::NewGuid().ToString()
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/bookings" `
  -Headers @{ "Idempotency-Key" = $key } -ContentType "application/json" -Body $body
```
Expect **201** with `accessCode`, Manila `startTime`, `totalAmount`.
**Replay the same `Idempotency-Key`** → **200** with the same booking (not a
duplicate).

### 4.6 Look up by access code

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/my-bookings?accessCode=$code&upcoming=true"
```

### 4.7 Cancel + reschedule by access code

```powershell
$bookingId = "<booking id>"
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/bookings/$bookingId/cancel" `
  -ContentType "application/json" -Body (@{ reason = "smoke test" } | ConvertTo-Json)
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/bookings/$bookingId/reschedule" `
  -ContentType "application/json" -Body (@{ startTime = "<new UTC slot>" } | ConvertTo-Json)
```

### 4.8 Validation failures (FluentValidation)

Call the same endpoints with bad payloads and expect a clean **400** Problem
Details (never a 500):

- `POST /api/auth/register` with a weak password / invalid email.
- `POST /api/bookings` with a past `startTime`, missing `guestContact.name`,
  or a `startTime` that isn't on a slot boundary.
- `POST /api/services` with blank name or negative price.
- `POST /api/staff` with an unassigned service id.

---

## 5. Concurrency / Double-Booking

**The core guarantee:** two simultaneous bookings for the same slot → exactly
one succeeds, the other gets a clean **409** (`slot is no longer available`),
never a 500.

**Manual smoke** (PowerShell, two terminals or one script):

```powershell
$body = <same body as §4.5, same $slot>
$r1 = Invoke-WebRequest -Method Post -Uri "http://localhost:5000/api/bookings" `
  -Headers @{ "Idempotency-Key" = [guid]::NewGuid().ToString() } -ContentType "application/json" -Body $body
$r2 = Invoke-WebRequest -Method Post -Uri "http://localhost:5000/api/bookings" `
  -Headers @{ "Idempotency-Key" = [guid]::NewGuid().ToString() } -ContentType "application/json" -Body $body
$r1.StatusCode; $r2.StatusCode   # one 201, one 409
```

**UI smoke:** open the wizard in two incognito windows, pick the same staff +
slot, and submit both. Exactly one reaches "See you there"; the other shows
"That slot just got taken." The DB keeps exactly one row
(verify in pgAdmin or `SELECT count(*) FROM "Bookings"` for that slot).

---

## 6. Real-Time (SignalR) — quick check

The API wires a SignalR hub. If present in the UI, open the staff calendar in
two tabs: creating/cancelling a booking in one should update the other's view.
(Not yet wired into every page — check for a toast/live update on the calendar.)

---

## 7. Design Quality Audit (impeccable detector)

After any UI change, run the detector over the affected routes. It launches a
real browser (Chromium via Puppeteer) and reports contrast, overflow, heading
hierarchy, and "AI-slop" signals.

```powershell
node "C:\Users\Carl\.config\opencode\skills\impeccable\scripts\detect.mjs" `
  --json --viewport 1280x800 "http://localhost:5173/"
```

Scan public and authenticated routes at **both** viewports:

| Viewport | Routes |
|---|---|
| `1280x800` | `/`, `/login`, `/register`, `/register-business`, `/book/<slug>` |
| `390x844` | same public routes |
| auth | `/dashboard`, `/profile`, `/staff/calendar`, `/admin/services`, `/admin/staff`, `/my-bookings` |

Authenticated pages need a logged-in session; reuse the smoke login or a token
bootstrap page. Expected findings at this stage: **none** — all 13 routes pass
clean at 1280x800 and 390x844. Intended-design exceptions are documented in
`.impeccable/config.json` (marquee, ledger grid, brass-glow overflow).

---

## 8. Final Regression Checklist

Before a release, tick off:

- [ ] `dotnet test Booking.sln` green (unit + integration incl. concurrency).
- [ ] `docker compose exec -T client npm run build` green (`tsc && vite build`).
- [ ] Owner: register business → services → staff → schedule → override.
- [ ] Guest: full 4-step wizard → access code shown.
- [ ] Customer: lookup by code, reschedule, cancel, slot freed after cancel.
- [ ] Staff: calendar shows bookings; status updates stick.
- [ ] Invitation link from API logs works in a private window.
- [ ] Double-booking race → one 201 + one 409, single DB row.
- [ ] Validation: bad payloads → 400 Problem Details, never 500.
- [ ] Availability: no-schedule → no slots; override add/remove works.
- [ ] Design scan clean on public + auth routes at desktop and mobile.
