# Public Booking API Contract

**Branch**: `feat/6.1-booking-wizard` | **Date**: 2026-08-15 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](../plan.md)

All endpoints here are **anonymous** (`[AllowAnonymous]`), read-only discovery, scoped by the business slug. The write and lookup endpoints they feed already exist and are unchanged (`POST /api/bookings`, `GET /api/bookings/my-bookings`).

Base path: `/api/public/businesses/{slug}`

## 1. Get public business

`GET /api/public/businesses/{slug}`

| Status | Meaning |
|---|---|
| 200 | `PublicBusinessResponse` |
| 404 | unknown slug (Problem Details) |

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "The Hair Room",
  "slug": "the-hair-room",
  "description": "Manila's neighbourhood salon.",
  "timezone": "Asia/Manila",
  "requireDeposit": false,
  "depositAmount": 100.0,
  "currency": "PHP",
  "advanceBookingDays": 30,
  "slotIntervalMinutes": 15
}
```

## 2. List public services

`GET /api/public/businesses/{slug}/services`

| Status | Meaning |
|---|---|
| 200 | `ServiceResponse[]` (active only, ordered by DisplayOrder) |
| 404 | unknown slug |

Reuses existing `ServiceResponse` unchanged:
```json
[
  {
    "id": "…",
    "name": "Haircut & Blowout",
    "description": "Cut + style with wash.",
    "durationMinutes": 60,
    "price": 650.0,
    "categoryId": "…",
    "categoryName": "Hair",
    "businessId": "…",
    "isActive": true,
    "displayOrder": 1,
    "color": "#B8862B"
  }
]
```

## 3. List public staff

`GET /api/public/businesses/{slug}/staff?serviceId=<guid>`

| Param | Required | Meaning |
|---|---|---|
| serviceId | no | filter staff who deliver this service |

| Status | Meaning |
|---|---|
| 200 | `PublicStaffResponse[]` (active only; PII stripped) |
| 404 | unknown slug |

```json
[
  {
    "id": "…",
    "fullName": "Ana Reyes",
    "displayOrder": 1,
    "serviceIds": ["…", "…"]
  }
]
```

Note: no `email`, `phone`, or `avatarUrl` is ever present (RA 10173).

## 4. Get availability

`GET /api/public/businesses/{slug}/availability?serviceId=<guid>&date=2026-08-15&staffId=<guid>`

| Param | Required | Meaning |
|---|---|---|
| serviceId | yes | the chosen service |
| date | yes | Manila calendar day, `yyyy-MM-dd` |
| staffId | no | restrict to one staff member |

| Status | Meaning |
|---|---|
| 200 | `AvailabilityResponse` (Manila-local `start`/`end` + UTC `startUtc`/`endUtc`) |
| 404 | unknown slug / service / business |

```json
{
  "serviceId": "…",
  "serviceName": "Haircut & Blowout",
  "date": "2026-08-15",
  "durationMinutes": 60,
  "slots": [
    {
      "staffId": "…",
      "staffName": "Ana Reyes",
      "start": "2026-08-15T09:00:00",
      "end": "2026-08-15T10:00:00",
      "startUtc": "2026-08-15T01:00:00Z",
      "endUtc": "2026-08-15T02:00:00Z"
    }
  ]
}
```

## Client contract rules

1. **Never synthesize times.** Only submit a slot time verbatim from `slots[].startUtc`.
2. **Submit UTC with `Z`.** `POST /api/bookings` `startTime` = `startUtc` value (the handler treats naive datetimes as UTC). Do not send Manila strings or local offsets.
3. **Idempotency-Key is required** on create; reuse the same key + payload to return the original booking (200) instead of duplicating (409 on key reuse with a different payload).
4. **409 on submit** means the slot just became unavailable — refresh availability and present fresh times (FR-009).
5. Deposit disclosure (FR-013): show `depositAmount`/`currency` when `requireDeposit` is true; do not collect payment.

## Error shape (shared)

All failures are Problem Details:
```json
{ "type": "about:blank", "title": "Not Found", "status": 404,
  "detail": "Business not found", "instance": "/api/public/businesses/…" }
```
