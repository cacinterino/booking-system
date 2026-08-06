namespace Booking.Domain;

public enum BookingStatus
{
    Pending = 1,
    Confirmed = 2,
    Cancelled = 3,
    Completed = 4,
    NoShow = 5
}

public enum NotificationChannel
{
    Email = 1,
    SMS = 2,
    Push = 3
}

public enum PaymentProvider
{
    PayMongo = 1
}

public enum PaymentStatus
{
    Pending = 1,
    Succeeded = 2,
    Failed = 3,
    Refunded = 4
}