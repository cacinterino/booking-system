namespace Booking.Application.Staff.DTOs;

public record StaffRequest(
    string FirstName,
    string LastName,
    string? Email = null,
    string? Phone = null,
    bool IsActive = true,
    int DisplayOrder = 0,
    IReadOnlyList<Guid>? ServiceIds = null,
    string? AvatarUrl = null
);

public record StaffResponse(
    Guid Id,
    string FirstName,
    string LastName,
    string FullName,
    string? Email,
    string? Phone,
    string? AvatarUrl,
    Guid BusinessId,
    bool IsActive,
    int DisplayOrder,
    Guid? UserId,
    IReadOnlyList<Guid> ServiceIds
);

public record ScheduleEntryRequest(
    DayOfWeek DayOfWeek,
    TimeSpan StartTime,
    TimeSpan EndTime,
    bool IsWorking = true
);

public record ScheduleEntryResponse(
    Guid Id,
    DayOfWeek DayOfWeek,
    TimeSpan StartTime,
    TimeSpan EndTime,
    bool IsWorking
);

public record ScheduleRequest(
    IReadOnlyList<ScheduleEntryRequest> Entries
);

public record ScheduleResponse(
    Guid StaffId,
    IReadOnlyList<ScheduleEntryResponse> Entries
);

public record OverrideRequest(
    DateOnly Date,
    bool IsTimeOff,
    TimeSpan? StartTime = null,
    TimeSpan? EndTime = null,
    string? Reason = null
);

public record OverrideResponse(
    Guid Id,
    DateOnly Date,
    bool IsTimeOff,
    TimeSpan? StartTime,
    TimeSpan? EndTime,
    string? Reason
);

public record StaffCalendarEntryResponse(
    OverrideResponse? Override,
    ScheduleEntryResponse? Schedule
);