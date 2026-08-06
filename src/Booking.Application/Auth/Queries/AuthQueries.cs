using MediatR;
using Booking.Application.Auth.DTOs;

namespace Booking.Application.Auth.Queries;

public record GetCurrentUserQuery(Guid UserId) : IRequest<UserDto>;