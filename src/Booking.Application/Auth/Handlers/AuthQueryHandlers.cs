using System.Security.Claims;
using MediatR;
using Booking.Application.Auth.DTOs;
using Booking.Application.Auth.Interfaces;
using Booking.Application.Auth.Queries;

namespace Booking.Application.Auth.Handlers;

public class GetCurrentUserQueryHandler : IRequestHandler<GetCurrentUserQuery, UserDto>
{
    private readonly IUserManager _userManager;

    public GetCurrentUserQueryHandler(IUserManager userManager)
    {
        _userManager = userManager;
    }

    public async Task<UserDto> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null)
            throw new UnauthorizedAccessException("User not found");

        var roles = await _userManager.GetRolesAsync(user);

        return new UserDto(user.Id, user.Email, user.FullName, user.PhoneNumber, user.BusinessId, roles.ToArray());
    }
}