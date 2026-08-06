using Booking.Application.Auth.Interfaces;

namespace Booking.Infrastructure.Auth;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}