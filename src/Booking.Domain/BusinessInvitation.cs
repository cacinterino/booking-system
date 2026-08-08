using System.Security.Cryptography;
using System.Text;

namespace Booking.Domain;

public class BusinessInvitation : Entity
{
    public Guid BusinessId { get; private set; }
    public Business? Business { get; private set; }
    public string Email { get; private set; } = string.Empty;
    public string Role { get; private set; } = "Staff";
    public string TokenHash { get; private set; } = string.Empty;
    public InvitationStatus Status { get; private set; } = InvitationStatus.Pending;
    public DateTime ExpiresAt { get; private set; }
    public Guid? AcceptedByUserId { get; private set; }
    public DateTime? AcceptedAt { get; private set; }

    private BusinessInvitation() { }

    private BusinessInvitation(Guid businessId, string email, string role, string tokenHash, DateTime expiresAt)
    {
        BusinessId = businessId;
        Email = email;
        Role = role;
        TokenHash = tokenHash;
        ExpiresAt = expiresAt;
    }

    public static string GenerateToken() => Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");

    public static string HashToken(string token)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(hash);
    }

    public static BusinessInvitation Create(Guid businessId, string email, string role, string rawToken, DateTime expiresAt)
    {
        return new BusinessInvitation(businessId, email, role, HashToken(rawToken), expiresAt);
    }

    public bool IsValid(string rawToken)
    {
        return Status == InvitationStatus.Pending
            && DateTime.UtcNow <= ExpiresAt
            && string.Equals(TokenHash, HashToken(rawToken), StringComparison.OrdinalIgnoreCase);
    }

    public void Accept(Guid userId)
    {
        Status = InvitationStatus.Accepted;
        AcceptedByUserId = userId;
        AcceptedAt = DateTime.UtcNow;
        MarkUpdated();
    }

    public void Revoke()
    {
        Status = InvitationStatus.Revoked;
        MarkUpdated();
    }
}