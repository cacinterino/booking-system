# 3-minute demo script

Everything below runs against the local stack (`docker compose up --build`, or API on `http://localhost:5000` plus `npm run dev` on `http://localhost:5173`).

Fill in the placeholders in square brackets **before** recording. Nothing here should be read word for word — it is a timing sheet.

---

## 0:00 – 0:20 — What it is

> "I built Booked., an appointment booking app for Philippine service businesses — salons, clinics, barbershops. Customers book a real open slot from a public page, and staff run the day from a weekly calendar. It's ASP.NET Core 9 with PostgreSQL on the back end and React on the front."

Show: `http://localhost:5173/` (landing page), then click **Product notes** → `/highlights`.

**Why this project:** [one or two sentences about your own experience — e.g. "I kept seeing my [relative/friend]'s salon take bookings through DMs and lose track."]

---

## 0:20 – 0:50 — The booking page

1. Open `http://localhost:5173/book/booked-demo`.
2. Pick **Signature Facial** → **Ana Santos**.
3. Point out the date strip and the slot grid.
4. Say: *"These slots aren't a fixed template. They're computed from Ana's Monday–Saturday 9-to-6 schedule, the 45-minute service length, the 15-minute slot interval, and the bookings that already exist."*
5. Click a slot, fill in a name/email/phone with obviously fake data (`demo.viewer@example.com`), submit.

> "The confirmation shows an access code. There's no customer account here — the code is how a guest comes back later."

---

## 0:50 – 1:20 — Look up + cancel with the code

1. Open `http://localhost:5173/my-bookings`.
2. Enter the code you just got (format `8F3K-2Q7X`).
3. Show the upcoming booking card. Cancel it.
4. Say: *"Cancelling reopens the slot immediately, because availability excludes cancelled bookings. It's soft-deleted, not hard-deleted, so the record stays for audit."*

Optional if time allows: go back to the booking page and show the slot is bookable again.

---

## 1:20 – 2:10 — Staff side

1. Log in at `http://localhost:5173/login` with `demo@booked.local` / `Demo123!`.
2. Land on `/dashboard`: *"This week's counts, pending confirmations, and the next appointment today — all read from the calendar endpoint, not hardcoded."*
3. Open `/staff/calendar`.
4. Confirm one pending booking, then mark another completed.
5. Say: *"Status transitions are enforced in the domain, not the controller — pending can go to confirmed, confirmed to completed or no-show, and a completed booking can't be cancelled."*

---

## 2:10 – 2:40 — The one thing worth asking me about

Open `docs/CASE_STUDY.md` or the `/highlights` page and point at the double-booking decision:

> "Two people can look at the same slot at the same time, and both application-level checks can pass before either write lands. So the final guard is a PostgreSQL exclusion constraint on the staff member's time range. One transaction wins; the loser gets a 409, not a 500. There's an integration test that fires two concurrent bookings at one slot and asserts exactly one succeeds."

If asked how you'd prove it live: `dotnet test tests/Booking.IntegrationTests`.

---

## 2:40 – 3:00 — Honest close

> "What's not here: payments, reminder scheduling, and live calendar push. Those are stubbed in the domain — there's a `Payment` entity and a `Notification` entity — but nothing calls them, and the UI doesn't claim they work. Next I'd invalidate the availability cache when a schedule changes, since it currently lives 60 seconds, and persist refresh tokens so revoke actually ends a session."

Show `README.md` → **Known limitations**.

---

## Pre-flight checklist (do this 10 minutes before recording)

- [ ] Postgres container running (`docker ps`)
- [ ] API healthy: `curl http://localhost:5000/api/health`
- [ ] Client up: `http://localhost:5173`
- [ ] Demo seed present (`/book/booked-demo` shows 3 services, 2 staff)
- [ ] At least one **pending** booking exists for the calendar demo
- [ ] Browser zoom at 100%, one window, no stray tabs
- [ ] Notifications off, phone on silent
- [ ] Test data deleted from `/my-bookings` localStorage ("Change code")

If the seed got messy from rehearsing, reset it:

```bash
docker compose down -v
docker compose up --build
```
