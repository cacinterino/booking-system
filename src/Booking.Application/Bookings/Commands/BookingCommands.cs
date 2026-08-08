using MediatR;
using Booking.Application.Bookings.DTOs;

namespace Booking.Application.Bookings.Commands;

public record CreateBookingCommand(
    CreateBookingRequest Request,
    string IdempotencyKey,
    Guid? AuthenticatedUserId) : IRequest<CreateBookingResult>;

public record CreateBookingResult(BookingResponse Booking, bool WasIdempotentRetry);

public record CancelBookingCommand(
    Guid BookingId,
    string? Reason,
    Guid? AuthenticatedUserId,
    string? AccessCode = null) : IRequest<Unit>;

public record RescheduleBookingCommand(
    Guid BookingId,
    DateTime NewStartTime,
    Guid? AuthenticatedUserId,
    string? AccessCode = null) : IRequest<BookingResponse>;

public record SetBookingStatusCommand(
    Guid BookingId,
    Domain.BookingStatus Status,
    Guid AuthenticatedUserId,
    bool IsAdmin) : IRequest<Unit>;