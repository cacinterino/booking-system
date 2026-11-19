using FluentAssertions;
using Booking.Domain;
using BookingEntity = Booking.Domain.Booking;

namespace Booking.UnitTests.Domain;

public class BookingLifecycleTests
{
    private static BookingEntity NewBooking()
    {
        var start = new DateTime(2026, 8, 10, 1, 0, 0, DateTimeKind.Utc);
        return new BookingEntity(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            start,
            start.AddHours(1),
            500m,
            0m,
            "lifecycle-key");
    }

    [Fact]
    public void Pending_CanBeConfirmed_ThenCompleted()
    {
        var booking = NewBooking();

        booking.Status.Should().Be(BookingStatus.Pending);
        booking.Confirm();
        booking.Status.Should().Be(BookingStatus.Confirmed);
        booking.ConfirmedAt.Should().NotBeNull();

        booking.Complete();
        booking.Status.Should().Be(BookingStatus.Completed);
        booking.CompletedAt.Should().NotBeNull();
    }

    [Fact]
    public void Pending_CannotJumpStraightToCompleted()
    {
        var booking = NewBooking();

        var act = () => booking.Complete();

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("Only confirmed bookings can be completed");
    }

    [Fact]
    public void CompletedBooking_CannotBeCancelled()
    {
        var booking = NewBooking();
        booking.Confirm();
        booking.Complete();

        var act = () => booking.Cancel("too late");

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot cancel this booking");
    }

    [Fact]
    public void CancelledBooking_CannotBeRescheduled()
    {
        var booking = NewBooking();
        booking.Cancel("customer changed plans");

        var act = () => booking.Reschedule(DateTime.UtcNow, DateTime.UtcNow.AddHours(1));

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("Only pending or confirmed bookings can be rescheduled");
    }

    [Fact]
    public void ConfirmedBooking_CanBeMarkedNoShow_ButPendingCannot()
    {
        var booking = NewBooking();

        var premature = () => booking.MarkNoShow();
        premature.Should().Throw<InvalidOperationException>();

        booking.Confirm();
        booking.MarkNoShow();
        booking.Status.Should().Be(BookingStatus.NoShow);
    }
}
