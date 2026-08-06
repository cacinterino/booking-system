using MediatR;
using Booking.Application.Auth.DTOs;
using Booking.Application.Business.DTOs;

namespace Booking.Application.Business.Commands;

public record RegisterBusinessCommand(RegisterBusinessRequest Request) : IRequest<AuthResponse>;

public record InviteStaffCommand(Guid BusinessId, InviteStaffRequest Request) : IRequest<InvitationResponse>;

public record AcceptInvitationCommand(AcceptInvitationRequest Request) : IRequest<AuthResponse>;