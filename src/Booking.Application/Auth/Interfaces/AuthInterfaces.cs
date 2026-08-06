using System.Security.Claims;

namespace Booking.Application.Auth.Interfaces;

public class ApplicationUser
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public Guid? BusinessId { get; set; }
    public bool EmailConfirmed { get; set; }
    public bool IsActive { get; set; } = true;
}

public class IdentityResult
{
    public bool Succeeded { get; set; }
    public IEnumerable<IdentityError> Errors { get; set; } = Enumerable.Empty<IdentityError>();

    public static IdentityResult Success => new() { Succeeded = true };
    public static IdentityResult Failed(params IdentityError[] errors) => new() { Succeeded = false, Errors = errors };
}

public class IdentityError
{
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public interface IUserManager
{
    Task<ApplicationUser?> FindByEmailAsync(string email);
    Task<ApplicationUser?> FindByIdAsync(string userId);
    Task<IdentityResult> CreateAsync(ApplicationUser user, string password);
    Task<IdentityResult> AddToRoleAsync(ApplicationUser user, string role);
    Task<IList<string>> GetRolesAsync(ApplicationUser user);
    Task<bool> CheckPasswordAsync(ApplicationUser user, string password);
    Task<IdentityResult> ChangePasswordAsync(ApplicationUser user, string currentPassword, string newPassword);
    Task<IdentityResult> ResetPasswordAsync(ApplicationUser user, string token, string newPassword);
    Task<string> GeneratePasswordResetTokenAsync(ApplicationUser user);
    Task<IdentityResult> UpdateAsync(ApplicationUser user);
}

public interface IJwtTokenService
{
    string GenerateAccessToken(ApplicationUser user, IEnumerable<string> roles);
    string GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    DateTime GetAccessTokenExpiry();
    DateTime GetRefreshTokenExpiry(bool rememberMe);
}

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string hashedPassword, string providedPassword);
}

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string email, string resetLink);
    Task SendWelcomeEmailAsync(string email, string firstName);
}

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    string[] Roles { get; }
    Guid? BusinessId { get; }
    bool IsAuthenticated { get; }
}

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}