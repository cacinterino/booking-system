# Booking Flow — API Contracts

**Base URL**: `http://localhost:5000` (dev). All routes under `/api/bookings`.
Timestamps returned are `Asia/Manila` local (converted at DTO boundary per
Constitution V); accepted/expected on input are UTC ISO-8601 with `Z`.

Errors follow the global shape (from research Decision 6):

```json
{ "type": "about:blank", "title": "Conflict", "status": 409,
  "detail": "the chosen slot is no longer available",
  "instance": "/api/bookings/..." }
```

---

## 1. Create Booking

**`POST /api/bookings`** — Public (guest with contact) or any authenticated
role (customer/staff/admin). Requires `Idempotency-Key` header.

Request:

```json
{
  "businessId": "guid",
  "serviceId": "guid",
  "staffId": "guid",
  "startTime": "2026-08-14T10:00:00",   // Asia/Manila, minus offset handled internally
  "notes": "optional, <=500 chars",
  "guestContact": { "name": "Juana Dela Cruz", "email": "juan@example.com", "phone": "639170000000" }
}
```

`guestContact` is REQUIRED when unauthenticated; omitted for authenticated
customers. Deposit/payment is not part of this call (deposits optional).

Responses:

| Status | Body | Meaning |
|--------|------|---------|
| 201 Created | `BookingResponse` | Booking created; location header `Location: /api/bookings/{id}` |
| 200 OK | `BookingResponse` | Idempotent retry — key already used, returns existing booking |
| 400 | Problem | validation failure |
| 404 | Problem | service/staff/business not found |
| 409 | Problem | slot unavailable (including exclusion `23P01` mapped to 409) |

---

## 2. My Bookings

**`GET /api/bookings/my-bookings`** — `[Authorize(Policy = "CustomerOnly")]` or
guest via `?accessCode=`.

| Query | Notes |
|-------|-------|
| `accessCode` | guest lookup code from creation response |
| `status` | optional filter: Upcoming (default) / Past / All |

Response: `BookingListResponse` — `{ items: [BookingResponse] }`, upcoming
sorted ascending, past descending.

---

## 3. Cancel

**`POST /api/bookings/{id}/cancel`** — authenticated owner (customer/staff/
admin) or guest with matching `accessCode` in body.

Request:

```json
{ "reason": "optional string", "accessCode": "guest code if guest" }
```

Responses: `204 No Content` on success; `404` unknown id; `409` already
cancelled/completed/started; `403` not the owner.

---

## 4. Reschedule

**`POST /api/bookings/{id}/reschedule`** — owner (authenticated customer via
JWT, or guest via `accessCode`) **OR staff/admin of the same business**
(staff-initiated per APPOINTMENT_BOOKING_PLAN §4.4).

Request:

```json
{ "startTime": "2026-08-15T14:00:00Z", "accessCode": "guest code if applicable" }
```

Responses: `200 OK` with `BookingResponse`; `409` new slot unavailable / booking
in terminal state; `400` validation; `403` not the owner or another business's
staff. On unavailability the existing booking is unchanged.

> **Rate limiting**: this public-facing write endpoint is throttled per IP in
> production (see APPOINTMENT_BOOKING_PLAN §8.4).

---

## 5. Admin list

**`GET /api/bookings`** — `[Authorize(Policy = "StaffOrAdmin")]`, admin view.

Query params: `status`, `staffId`, `dateFrom`, `dateTo`, `page`, `pageSize`.

Response: `{ items: [...], total, page, pageSize }`.

---

## 6. Calendar events

**`GET /api/bookings/calendar?from=2026-08-01&to=2026-08-31`** —
`[Authorize(Policy = "StaffOrAdmin")]`. Staff see own (use claim businessId +
current user's staff id); admin sees all.

Response: `[ { "id", "title", "start", "end", "status", "staffId", "customerName" } ]`
(start/end as Manila ISO strings, not full booking DTO).

---

## 7. Status transition

**`PUT /api/bookings/{id}/status`** — `[Authorize(Policy = "StaffOrAdmin")]`.

Request:

```json
{ "status": "Confirmed" | "Completed" | "NoShow" }
```

Responses: `204 No Content` on success; `409` if transition invalid per the
state matrix (pending → completed forbidden); `403` staff of another business;
`404` unknown. Does not permit Cancel here (that has its own endpoint).

---

## 8. Deferred — confirmation link (do NOT implement in this slice)

**`GET /api/bookings/{id}/confirm/{token}`** — public link from e.g. an email
(APPOINTMENT_BOOKING_PLAN §4.4). Relies on email delivery, which is a
deferred phase; spec decision Q2 = confirmation recorded in-system only.
Retained here for traceability; scheduled with notifications, not this slice.

## 9. Cross-cutting

- **Rate limiting**: `POST /api/bookings` (public create) throttled per IP
  (APPOINTMENT_BOOKING_PLAN §8.4 pre-deploy checklist).