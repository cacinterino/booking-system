using MediatR;
using Booking.Application.Availability.DTOs;

namespace Booking.Application.Availability.Queries;

public record GetAvailabilityQuery(
    Guid BusinessId,
    Guid ServiceId,
    DateOnly Date,
    Guid? StaffId = null
) : IRequest<AvailabilityResponse>;