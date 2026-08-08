namespace Booking.Application.Bookings.Exceptions;

/// <summary>
/// Thrown when a requested operation conflicts with current state, e.g. the
/// chosen slot is already booked. Mapped to HTTP 409 at the controller boundary.
/// </summary>
public class BookingConflictException : Exception
{
    public BookingConflictException(string message) : base(message)
    {
    }
}

/// <summary>
/// Raised by the persistence layer when a write races on the idempotency key
/// unique index. The handler treats it as a retry and re-queries the existing
/// booking, which the API returns as 200.
/// </summary>
public class IdempotencyConflictException : Exception
{
    public IdempotencyConflictException(string message) : base(message)
    {
    }
}