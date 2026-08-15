# Data Model: Public Booking Wizard

**Branch**: `feat/6.1-booking-wizard` | **Date**: 2026-08-15 | **Spec**: [spec.md](./spec.md)

This slice adds no persistence entities. It introduces two new response DTOs (one reuses an existing DTO) and a public query handler. All storage types are unchanged.

## Existing entities used (read-only)

### Business (source: `Booking.Domain.Business` + owned `BusinessSettings`)
| Field | Type | Public? |
|---|---|---|
| Id | Guid | yes |
| Name | string | yes |
| Slug | string | yes |
| Description | string? | yes |
| Timezone | string (`Asia/Manila`) | yes |
| Settings.SlotIntervalMinutes | int (15) | yes |
| Settings.AdvanceBookingDays | int (30) | yes |
| Settings.RequireDeposit | bool (false) | yes |
| Settings.DepositAmount | decimal (100) | yes |
| Settings.Currency | string (`PHP`) | yes |
| Address / Phone / Email | string? | **no** — PII/contact, withheld from public |

### Service (source: `ServiceResponse` — reused as-is)
`Id`, `Name`, `Description`, `DurationMinutes`, `Price`, `CategoryId`, `CategoryName`, `DisplayOrder`, `Color`. No PII → safe to expose unchanged. Public listing filters `IsActive = true` via `GetServicesQuery(IncludeInactive: false)`.

### Staff (source: `StaffResponse` → new `PublicStaffResponse`)
| Field | Type | Public? |
|---|---|---|
| Id | Guid | yes |
| FullName | string | yes |
| ServiceIds | IReadOnlyList<Guid> | yes |
| DisplayOrder | int | yes |
| Email / Phone / AvatarUrl | — | **no** — RA 10173: stripped |

## New DTOs

### PublicBusinessResponse (Application → DTOs/BusinessDtos.cs)
```csharp
public record PublicBusinessResponse(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string Timezone,
    bool RequireDeposit,
    decimal DepositAmount,
    string Currency,
    int AdvanceBookingDays,
    int SlotIntervalMinutes);
```

### PublicStaffResponse (Application → DTOs/StaffDtos.cs)
```csharp
public record PublicStaffResponse(
    Guid Id,
    string FullName,
    int DisplayOrder,
    IReadOnlyList<Guid> ServiceIds);
```

## New query

```csharp
public record GetPublicBusinessQuery(string Slug) : IRequest<PublicBusinessResponse>;
```

- Handler: `IBusinessRepository.GetBySlugAsync(slug)` → map entity+settings to `PublicBusinessResponse`; null → `KeyNotFoundException` → 404 via the global handler.

## State transitions

None. This slice is read-only public discovery; booking lifecycle and status transitions already shipped in 4.4 and are untouched.

## Validation rules

- Slug: existing `Business.Slug` generation rules (slugified, unique-indexed). Public handler treats unknown slug as 404.
- No new validation in this slice (client-side form validation for name/email/phone is covered by the existing `CreateBookingRequestValidator` on the reused write path).

## Cache keys

- Availability: unchanged (`availability:{businessId}:{serviceId}:{staffId-or-any}:{date}`, TTL 1 min).
- Services/staff/business: no cache added (existing queries are cheap; keep this slice minimal). Revisit if the public volume warrants it.
