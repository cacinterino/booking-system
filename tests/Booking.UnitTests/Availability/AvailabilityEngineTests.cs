using FluentAssertions;
using Booking.Application.Availability;

namespace Booking.UnitTests.Availability;

public class AvailabilityEngineTests
{
    // References: Manila = UTC+8. Date 2026-08-10 is a Monday.
    private static readonly DateOnly Monday = new(2026, 8, 10);
    private static readonly TimeSpan Manila = TimeSpan.FromHours(8);
    private static readonly DateTime UtcNow = new(2026, 8, 10, 0, 0, 0, DateTimeKind.Utc); // 8am Manila

    private static DateTime DayStartUtc() =>
        Monday.ToDateTime(new TimeOnly(0, 0), DateTimeKind.Unspecified) - Manila;

    private static StaffAvailabilityInput Staff(
        Guid? id = null,
        TimeSpan? start = null,
        TimeSpan? end = null,
        IReadOnlyList<BlockedInterval>? bookings = null)
    {
        return new StaffAvailabilityInput(
            id ?? Guid.NewGuid(),
            "staff",
            start ?? new TimeSpan(9, 0, 0),
            end ?? new TimeSpan(17, 0, 0),
            bookings ?? new List<BlockedInterval>());
    }

    private static IReadOnlyList<BlockedInterval> WithBooking(Guid staffId, int startHour, int endHour)
    {
        var day = DayStartUtc();
        return new List<BlockedInterval>
        {
            new(staffId, day + new TimeSpan(startHour, 0, 0), day + new TimeSpan(endHour, 0, 0))
        };
    }

    private static DateTime Slot(int startHour) => DayStartUtc() + new TimeSpan(startHour, 0, 0);

    [Fact]
    public void NoBookings_ReturnsAllSlotsAcrossWindow()
    {
        var input = Staff(start: new TimeSpan(9, 0, 0), end: new TimeSpan(17, 0, 0));
        var slots = AvailabilityEngine.Compute(Monday, 60, 60, Manila, UtcNow, new[] { input });

        slots.Count.Should().Be(8);
        slots.Select(s => s.StartUtc).Should().OnlyHaveUniqueItems();
        slots.Min(s => s.StartUtc).Should().Be(Slot(9));
    }

    [Fact]
    public void FullyBooked_ReturnsNoSlots()
    {
        var staff = Staff();
        var locked = Staff(id: staff.StaffId, bookings: WithBooking(staff.StaffId, 9, 17));
        var slots = AvailabilityEngine.Compute(Monday, 60, 60, Manila, UtcNow, new[] { locked });

        slots.Should().BeEmpty();
    }

    [Fact]
    public void PartialBooking_RemovesOnlyOverlappingSlots()
    {
        var staff = Staff();
        var withBooking = Staff(id: staff.StaffId, bookings: WithBooking(staff.StaffId, 11, 12));
        var slots = AvailabilityEngine.Compute(Monday, 60, 60, Manila, UtcNow, new[] { withBooking });
        var starts = slots.Select(s => s.StartUtc).ToList();

        starts.Should().Contain(Slot(9));
        starts.Should().Contain(Slot(10));
        starts.Should().NotContain(Slot(11));
        starts.Should().Contain(Slot(12));
        starts.Should().Contain(Slot(16));
    }

    [Fact]
    public void ShorterWindow_ProducesFewerSlots()
    {
        var input = Staff(start: new TimeSpan(9, 0, 0), end: new TimeSpan(12, 0, 0));
        var slots = AvailabilityEngine.Compute(Monday, 60, 60, Manila, UtcNow, new[] { input });

        slots.Count.Should().Be(3);
    }

    [Fact]
    public void ZeroLengthWindow_ReturnsNoSlots()
    {
        var input = Staff(start: new TimeSpan(23, 0, 0), end: new TimeSpan(0, 0, 0));
        var slots = AvailabilityEngine.Compute(Monday, 60, 60, Manila, UtcNow, new[] { input });

        slots.Should().BeEmpty();
    }

    [Fact]
    public void PastSlots_AreExcluded()
    {
        var now = DayStartUtc() + new TimeSpan(10, 0, 0); // 10:00 local on the day
        var input = Staff(start: new TimeSpan(9, 0, 0), end: new TimeSpan(12, 0, 0));
        var slots = AvailabilityEngine.Compute(Monday, 60, 60, Manila, now, new[] { input });
        var starts = slots.Select(s => s.StartUtc).ToList();

        starts.Should().NotContain(Slot(9));
        starts.Should().Contain(Slot(10));
        starts.Should().Contain(Slot(11));
    }

    [Fact]
    public void MultipleStaff_ProduceCombinedSlots()
    {
        var s1 = Staff(start: new TimeSpan(9, 0, 0), end: new TimeSpan(10, 0, 0));
        var s2 = Staff(start: new TimeSpan(10, 0, 0), end: new TimeSpan(11, 0, 0));
        var slots = AvailabilityEngine.Compute(Monday, 60, 60, Manila, UtcNow, new[] { s1, s2 });

        slots.Should().HaveCount(2);
        slots.Select(s => s.StaffId).Distinct().Should().HaveCount(2);
    }

    [Fact]
    public void ServiceLongerThanWindow_ReturnsNoSlots()
    {
        var input = Staff(start: new TimeSpan(9, 0, 0), end: new TimeSpan(10, 0, 0));
        var slots = AvailabilityEngine.Compute(Monday, 120, 60, Manila, UtcNow, new[] { input });

        slots.Should().BeEmpty();
    }

    [Fact]
    public void SlotIntervalAlignsToWindowStart()
    {
        var input = Staff(start: new TimeSpan(9, 0, 0), end: new TimeSpan(10, 0, 0));
        var slots = AvailabilityEngine.Compute(Monday, 30, 15, Manila, UtcNow, new[] { input });

        // 30-min service, 15-min interval within 9:00-10:00 = 9:00, 9:15, 9:30 (9:45 ends past the window)
        slots.Count.Should().Be(3);
    }

    [Fact]
    public void NoStaff_ReturnsEmpty()
    {
        var slots = AvailabilityEngine.Compute(Monday, 60, 60, Manila, UtcNow, Array.Empty<StaffAvailabilityInput>());
        slots.Should().BeEmpty();
    }
}
