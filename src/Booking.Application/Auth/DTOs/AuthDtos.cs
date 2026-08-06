namespace Booking.Application.Auth.DTOs;

public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? PhoneNumber = null
);

public record LoginRequest(
    string Email,
    string Password,
    bool RememberMe = false
);

public record RefreshTokenRequest(
    string RefreshToken
);

public record ForgotPasswordRequest(
    string Email
);

public record ResetPasswordRequest(
    string Email,
    string Token,
    string NewPassword
);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User
);

public record UserDto(
    Guid Id,
    string Email,
    string FullName,
    string? PhoneNumber,
    Guid? BusinessId,
    string[] Roles
);

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword
);

public record UpdateProfileRequest(
    string FirstName,
    string LastName,
    string? PhoneNumber
);