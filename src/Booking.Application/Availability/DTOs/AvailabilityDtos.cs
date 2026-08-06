namespace Booking.Application.Availability.DTOs;

public record AvailableSlotResponse(
    Guid StaffId,
    string StaffName,
    string Start,       // Local time, Asia/Manila, e.g. "2026-08-10T09:00:00"
    string End,         // Local time, Asia/Manila
    DateTime StartUtc,
    DateTime EndUtc
);

public record AvailabilityResponse(
    Guid ServiceId,
    string ServiceName,
    DateOnly Date,
    int DurationMinutes,
    IReadOnlyList<AvailableSlotResponse> Slots
);