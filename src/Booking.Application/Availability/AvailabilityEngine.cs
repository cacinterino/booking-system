namespace Booking.Application.Availability;

public sealed record BlockedInterval(Guid StaffId, DateTime StartUtc, DateTime EndUtc);

public sealed record StaffAvailabilityInput(
    Guid StaffId,
    string StaffName,
    TimeSpan WorkingStartLocal,
    TimeSpan WorkingEndLocal,
    IReadOnlyList<BlockedInterval> Bookings);

public sealed record AvailableSlot(
    Guid StaffId,
    string StaffName,
    DateTime StartUtc,
    DateTime EndUtc);

/// <summary>
/// Core availability algorithm. Pure function: combines a staff member's working
/// window (already resolved from weekly schedule + overrides), existing bookings,
/// service duration and slot interval to produce open slots for one day.
/// All bookings and returned slots are UTC; local times are resolved by the caller.
/// </summary>
public static class AvailabilityEngine
{
    public static IReadOnlyList<AvailableSlot> Compute(
        DateOnly date,
        int serviceDurationMinutes,
        int slotIntervalMinutes,
        TimeSpan offsetFromUtc,
        DateTime utcNow,
        IReadOnlyList<StaffAvailabilityInput> staffInputs)
    {
        var result = new List<AvailableSlot>();

        if (serviceDurationMinutes <= 0 || slotIntervalMinutes <= 0)
            return result;

        foreach (var staff in staffInputs)
        {
            var dayStartLocal = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified);
            var utcDayStart = dayStartLocal - offsetFromUtc;

            var windowStartUtc = utcDayStart + staff.WorkingStartLocal;
            var windowEndUtc = utcDayStart + staff.WorkingEndLocal;

            var duration = TimeSpan.FromMinutes(serviceDurationMinutes);
            var interval = TimeSpan.FromMinutes(slotIntervalMinutes);

            for (var slotStart = windowStartUtc; slotStart + duration <= windowEndUtc; slotStart += interval)
            {
                var slotEnd = slotStart + duration;

                if (slotStart < utcNow)
                    continue;

                if (staff.Bookings.Any(b => slotStart < b.EndUtc && slotEnd > b.StartUtc))
                    continue;

                result.Add(new AvailableSlot(
                    staff.StaffId,
                    staff.StaffName,
                    DateTime.SpecifyKind(slotStart, DateTimeKind.Utc),
                    DateTime.SpecifyKind(slotEnd, DateTimeKind.Utc)));
            }
        }

        return result;
    }
}