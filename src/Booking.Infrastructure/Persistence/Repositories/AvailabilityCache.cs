using Microsoft.Extensions.Caching.Memory;
using Booking.Application.Bookings.Interfaces;

namespace Booking.Infrastructure.Persistence.Repositories;

public class AvailabilityCache : IAvailabilityCache
{
    private const string Region = "availability";
    private readonly IMemoryCache _cache;

    public AvailabilityCache(IMemoryCache cache)
    {
        _cache = cache;
    }

    public T? Get<T>(string key)
    {
        return _cache.TryGetValue(key, out var value) ? (T?)value : default;
    }

    public void Set<T>(string key, T value, TimeSpan duration)
    {
        _cache.Set(key, value, duration);
    }

    public void Invalidate(Guid businessId, Guid serviceId, Guid? staffId, DateTime startUtc, DateTime endUtc)
    {
        // Read-handler keys: {region}:{businessId}:{serviceId}:{staff-or-any}:{Date(Manila)}.
        // We cannot enumerate IMemoryCache keys, so remove the exact key shapes for the
        // affected Manila dates (any staff + specific staff, ±1 day for timezone edges).
        var manilaOffset = TimeSpan.FromHours(8);
        var dates = new HashSet<string>();
        for (var d = startUtc.Add(manilaOffset).Date; d <= endUtc.Add(manilaOffset).Date; d = d.AddDays(1))
        {
            dates.Add(DateOnly.FromDateTime(d).ToString("yyyy-MM-dd"));
            dates.Add(DateOnly.FromDateTime(d).AddDays(-1).ToString("yyyy-MM-dd"));
            dates.Add(DateOnly.FromDateTime(d).AddDays(1).ToString("yyyy-MM-dd"));
        }

        foreach (var date in dates)
        {
            _cache.Remove($"{Region}:{businessId}:{serviceId}:any:{date}");
            if (staffId.HasValue)
                _cache.Remove($"{Region}:{businessId}:{serviceId}:{staffId}:{date}");
        }
    }
}