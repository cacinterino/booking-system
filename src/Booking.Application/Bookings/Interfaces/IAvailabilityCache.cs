namespace Booking.Application.Bookings.Interfaces;

public interface IAvailabilityCache
{
    T? Get<T>(string key);
    void Set<T>(string key, T value, TimeSpan duration);
    void Invalidate(Guid businessId, Guid serviceId, Guid? staffId, DateTime startUtc, DateTime endUtc);
}