namespace Booking.Domain;

public class Payment : Entity
{
    public Guid BookingId { get; private set; }
    public Booking? Booking { get; private set; }
    public PaymentProvider Provider { get; private set; }
    public PaymentStatus Status { get; private set; } = PaymentStatus.Pending;
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "PHP";
    public string ProviderReference { get; private set; } = string.Empty;
    public string? ProviderResponse { get; private set; }
    public DateTime? PaidAt { get; private set; }

    private Payment() { }

    public Payment(Guid bookingId, PaymentProvider provider, decimal amount, string currency, string providerReference)
    {
        BookingId = bookingId;
        Provider = provider;
        Amount = amount;
        Currency = currency;
        ProviderReference = providerReference;
    }

    public void MarkSucceeded(string? providerResponse = null)
    {
        Status = PaymentStatus.Succeeded;
        PaidAt = DateTime.UtcNow;
        ProviderResponse = providerResponse;
        MarkUpdated();
    }

    public void MarkFailed(string? providerResponse = null)
    {
        Status = PaymentStatus.Failed;
        ProviderResponse = providerResponse;
        MarkUpdated();
    }

    public void MarkRefunded(string? providerResponse = null)
    {
        Status = PaymentStatus.Refunded;
        ProviderResponse = providerResponse;
        MarkUpdated();
    }
}