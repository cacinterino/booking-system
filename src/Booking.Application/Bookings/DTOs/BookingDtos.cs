using Booking.Domain;

namespace Booking.Application.Bookings.DTOs;

public record GuestContactRequest(string? Name, string? Email, string? Phone);

public record CreateBookingRequest(
    Guid BusinessId,
    Guid ServiceId,
    Guid StaffId,
    DateTime StartTime,
    string? Notes,
    GuestContactRequest? GuestContact = null);

public record CancelBookingRequest(string? Reason = null, string? AccessCode = null);

public record RescheduleBookingRequest(DateTime StartTime, string? AccessCode = null);

public record SetBookingStatusRequest(BookingStatus Status);

public record BookingResponse(
    Guid Id,
    Guid BusinessId,
    Guid ServiceId,
    string ServiceName,
    Guid StaffId,
    string StaffName,
    Guid CustomerId,
    string CustomerName,
    string StartTime,
    string EndTime,
    BookingStatus Status,
    decimal TotalAmount,
    string? Notes,
    string? AccessCode);

public record BookingListResponse(
    IReadOnlyList<BookingResponse> Items,
    int Total,
    int Page,
    int PageSize);

public record CalendarEventDto(
    Guid Id,
    string Title,
    string Start,
    string End,
    BookingStatus Status,
    Guid StaffId,
    string CustomerName);