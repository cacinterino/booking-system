using MediatR;
using Booking.Application.Bookings.DTOs;

namespace Booking.Application.Bookings.Queries;

public record MyBookingsQuery(
    Guid? AuthenticatedUserId,
    string? AccessCode = null,
    bool UpcomingOnly = false) : IRequest<IReadOnlyList<BookingResponse>>;

public record GetBookingQuery(Guid BookingId) : IRequest<BookingResponse>;