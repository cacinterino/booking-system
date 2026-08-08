using MediatR;
using Booking.Application.Bookings.DTOs;
using Booking.Domain;

namespace Booking.Application.Bookings.Queries;

public record MyBookingsQuery(
    Guid? AuthenticatedUserId,
    string? AccessCode = null,
    bool UpcomingOnly = false) : IRequest<IReadOnlyList<BookingResponse>>;

public record GetBookingQuery(Guid BookingId) : IRequest<BookingResponse>;

public record ListBookingsQuery(
    Guid BusinessId,
    BookingStatus? Status,
    Guid? StaffId,
    DateTime? FromDate,
    DateTime? ToDate,
    int Page = 1,
    int PageSize = 20) : IRequest<BookingListResponse>;

public record GetCalendarQuery(
    Guid BusinessId,
    Guid? StaffId,
    Guid AuthenticatedUserId,
    bool IsAdmin,
    DateOnly From,
    DateOnly To) : IRequest<IReadOnlyList<CalendarEventDto>>;