namespace Booking.Application.Business.DTOs;

public record RegisterBusinessRequest(
    string BusinessName,
    string BusinessSlug,
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? PhoneNumber = null,
    string? Description = null,
    string? Address = null
);

public record InviteStaffRequest(
    string Email,
    string Role = "Staff"
);

public record InvitationResponse(
    Guid Id,
    Guid BusinessId,
    string Email,
    string Role,
    string Status,
    DateTime ExpiresAt,
    string? AcceptUrl
);

public record AcceptInvitationRequest(
    string Token,
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? PhoneNumber = null
);