namespace Booking.Domain;

public class Booking : Entity
{
    public Guid BusinessId { get; private set; }
    public Business? Business { get; private set; }
    public Guid ServiceId { get; private set; }
    public Service? Service { get; private set; }
    public Guid StaffId { get; private set; }
    public Staff? Staff { get; private set; }
    public Guid CustomerId { get; private set; }
    public Customer? Customer { get; private set; }
    public DateTime StartTime { get; private set; }
    public DateTime EndTime { get; private set; }
    public BookingStatus Status { get; private set; } = BookingStatus.Pending;
    public string? Notes { get; private set; }
    public string? CancellationReason { get; private set; }
    public string IdempotencyKey { get; private set; } = string.Empty;
    public string? AccessCode { get; private set; }
    public decimal TotalAmount { get; private set; }
    public decimal DepositAmount { get; private set; }
    public DateTime? ConfirmedAt { get; private set; }
    public DateTime? CancelledAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public Payment? Payment { get; private set; }

    private readonly List<BookingService> _services = new();
    public IReadOnlyCollection<BookingService> Services => _services.AsReadOnly();

    private Booking() { }

    public Booking(Guid businessId, Guid serviceId, Guid staffId, Guid customerId, DateTime startTime, DateTime endTime, decimal totalAmount, decimal depositAmount, string idempotencyKey, string? notes = null)
    {
        BusinessId = businessId;
        ServiceId = serviceId;
        StaffId = staffId;
        CustomerId = customerId;
        StartTime = startTime;
        EndTime = endTime;
        TotalAmount = totalAmount;
        DepositAmount = depositAmount;
        IdempotencyKey = idempotencyKey;
        Notes = notes;
    }

    public void SetAccessCode(string accessCode)
    {
        AccessCode = accessCode;
        MarkUpdated();
    }

    public void AddService(BookingService bookingService)
    {
        _services.Add(bookingService);
        MarkUpdated();
    }

    public void Confirm()
    {
        if (Status != BookingStatus.Pending)
            throw new InvalidOperationException("Only pending bookings can be confirmed");

        Status = BookingStatus.Confirmed;
        ConfirmedAt = DateTime.UtcNow;
        MarkUpdated();
    }

    public void Cancel(string reason)
    {
        if (Status == BookingStatus.Cancelled || Status == BookingStatus.Completed)
            throw new InvalidOperationException("Cannot cancel this booking");

        Status = BookingStatus.Cancelled;
        CancellationReason = reason;
        CancelledAt = DateTime.UtcNow;
        MarkUpdated();
    }

    public void Complete()
    {
        if (Status != BookingStatus.Confirmed)
            throw new InvalidOperationException("Only confirmed bookings can be completed");

        Status = BookingStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        MarkUpdated();
    }

    public void MarkNoShow()
    {
        if (Status != BookingStatus.Confirmed)
            throw new InvalidOperationException("Only confirmed bookings can be marked as no-show");

        Status = BookingStatus.NoShow;
        MarkUpdated();
    }

    public void Reschedule(DateTime newStartTime, DateTime newEndTime)
    {
        if (Status != BookingStatus.Pending && Status != BookingStatus.Confirmed)
            throw new InvalidOperationException("Only pending or confirmed bookings can be rescheduled");

        StartTime = newStartTime;
        EndTime = newEndTime;
        MarkUpdated();
    }
}

public class BookingService : Entity
{
    public Guid BookingId { get; private set; }
    public Booking? Booking { get; private set; }
    public Guid ServiceId { get; private set; }
    public Service? Service { get; private set; }
    public string ServiceName { get; private set; } = string.Empty;
    public int DurationMinutes { get; private set; }
    public decimal Price { get; private set; }

    private BookingService() { }

    public BookingService(Guid bookingId, Guid serviceId, string serviceName, int durationMinutes, decimal price)
    {
        BookingId = bookingId;
        ServiceId = serviceId;
        ServiceName = serviceName;
        DurationMinutes = durationMinutes;
        Price = price;
    }
}