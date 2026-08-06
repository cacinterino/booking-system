using MediatR;
using Booking.Application.Auth.DTOs;

namespace Booking.Application.Auth.Commands;

public record RegisterCommand(RegisterRequest Request) : IRequest<AuthResponse>;

public record LoginCommand(LoginRequest Request) : IRequest<AuthResponse>;

public record RefreshTokenCommand(RefreshTokenRequest Request) : IRequest<AuthResponse>;

public record RevokeTokenCommand(string RefreshToken) : IRequest<Unit>;

public record ForgotPasswordCommand(ForgotPasswordRequest Request) : IRequest<Unit>;

public record ResetPasswordCommand(ResetPasswordRequest Request) : IRequest<Unit>;

public record ChangePasswordCommand(Guid UserId, ChangePasswordRequest Request) : IRequest<Unit>;

public record UpdateProfileCommand(Guid UserId, UpdateProfileRequest Request) : IRequest<UserDto>;