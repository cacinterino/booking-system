using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Booking.Application.Auth.Interfaces;

namespace Booking.Infrastructure.Auth;

public class JwtTokenService : IJwtTokenService
{
    public const string TokenTypeClaim = "token_type";
    public const string AccessTokenType = "access";
    public const string RefreshTokenType = "refresh";

    private readonly JwtSettings _settings;

    public JwtTokenService(IOptions<JwtSettings> settings)
    {
        _settings = settings.Value;
    }

    public string GenerateAccessToken(ApplicationUser user, IEnumerable<string> roles)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FullName),
            new("businessId", user.BusinessId?.ToString() ?? string.Empty)
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        return WriteToken(claims, AccessTokenType, DateTime.UtcNow.AddMinutes(_settings.AccessTokenExpiryMinutes));
    }

    /// <summary>
    /// Refresh tokens are signed JWTs too, but they carry <c>token_type=refresh</c>
    /// and a 7-day lifetime. The bearer middleware rejects them, so they can only
    /// be exchanged at POST /api/auth/refresh.
    /// </summary>
    public string GenerateRefreshToken(ApplicationUser user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email)
        };

        return WriteToken(claims, RefreshTokenType, DateTime.UtcNow.AddDays(_settings.RefreshTokenExpiryDays));
    }

    private string WriteToken(IEnumerable<Claim> claims, string tokenType, DateTime expires)
    {
        var allClaims = claims.Append(new Claim(TokenTypeClaim, tokenType));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: allClaims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key)),
            ValidateLifetime = false
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        try
        {
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);
            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                return null;

            // An access token must never be usable as a refresh token.
            if (principal.FindFirst(TokenTypeClaim)?.Value != RefreshTokenType)
                return null;

            return principal;
        }
        catch
        {
            return null;
        }
    }

    public DateTime GetAccessTokenExpiry() => DateTime.UtcNow.AddMinutes(_settings.AccessTokenExpiryMinutes);
    public DateTime GetRefreshTokenExpiry(bool rememberMe) => DateTime.UtcNow.AddDays(rememberMe ? _settings.RefreshTokenExpiryDays : 1);
}
