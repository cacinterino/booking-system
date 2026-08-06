namespace Booking.Domain;

public class Notification : Entity
{
    public Guid BusinessId { get; private set; }
    public Business? Business { get; private set; }
    public Guid? BookingId { get; private set; }
    public Booking? Booking { get; private set; }
    public Guid? CustomerId { get; private set; }
    public Customer? Customer { get; private set; }
    public Guid? StaffId { get; private set; }
    public Staff? Staff { get; private set; }
    public NotificationChannel Channel { get; private set; }
    public string Subject { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;
    public string? RecipientEmail { get; private set; }
    public string? RecipientPhone { get; private set; }
    public DateTime? SentAt { get; private set; }
    public bool IsSent { get; private set; }
    public string? ErrorMessage { get; private set; }
    public int RetryCount { get; private set; }

    private Notification() { }

    public Notification(Guid businessId, NotificationChannel channel, string subject, string body, string? recipientEmail = null, string? recipientPhone = null, Guid? bookingId = null, Guid? customerId = null, Guid? staffId = null)
    {
        BusinessId = businessId;
        Channel = channel;
        Subject = subject;
        Body = body;
        RecipientEmail = recipientEmail;
        RecipientPhone = recipientPhone;
        BookingId = bookingId;
        CustomerId = customerId;
        StaffId = staffId;
    }

    public void MarkSent()
    {
        IsSent = true;
        SentAt = DateTime.UtcNow;
        MarkUpdated();
    }

    public void MarkFailed(string errorMessage)
    {
        ErrorMessage = errorMessage;
        RetryCount++;
        MarkUpdated();
    }
}