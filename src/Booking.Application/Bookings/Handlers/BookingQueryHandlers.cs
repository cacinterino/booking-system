using Booking.Application.Bookings.DTOs;
using Booking.Application.Bookings.Interfaces;
using Booking.Application.Bookings.Queries;
using MediatR;

namespace Booking.Application.Bookings.Handlers;

public class MyBookingsQueryHandler : IRequestHandler<MyBookingsQuery, IReadOnlyList<BookingResponse>>
{
    private readonly IBookingRepository _bookingRepo;

    public MyBookingsQueryHandler(IBookingRepository bookingRepo)
    {
        _bookingRepo = bookingRepo;
    }

    public async Task<IReadOnlyList<BookingResponse>> Handle(MyBookingsQuery query, CancellationToken cancellationToken)
    {
        var customerId = await ResolveCustomerIdAsync(query, cancellationToken);

        var bookings = await _bookingRepo.GetByCustomerAsync(customerId, query.UpcomingOnly, cancellationToken);

        return bookings.Select(BookingDtoMapper.ToResponse).ToList();
    }

    private async Task<Guid> ResolveCustomerIdAsync(MyBookingsQuery query, CancellationToken cancellationToken)
    {
        if (query.AuthenticatedUserId.HasValue)
        {
            var owner = await _bookingRepo.GetCustomerByUserIdAsync(query.AuthenticatedUserId.Value, cancellationToken);
            if (owner is null)
                throw new UnauthorizedAccessException("You are not a registered customer");
            return owner.Id;
        }

        if (!string.IsNullOrEmpty(query.AccessCode))
        {
            var guest = await _bookingRepo.GetCustomerByAccessCodeAsync(query.AccessCode, cancellationToken);
            if (guest is null)
                throw new UnauthorizedAccessException("Invalid access code");
            return guest.Id;
        }

        throw new UnauthorizedAccessException("A customer or access code is required");
    }
}