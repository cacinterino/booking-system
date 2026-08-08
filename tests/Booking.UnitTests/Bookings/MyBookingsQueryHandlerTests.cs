using FluentAssertions;
using Moq;
using Booking.Application.Bookings.Handlers;
using Booking.Application.Bookings.Interfaces;
using Booking.Application.Bookings.DTOs;
using Booking.Application.Bookings.Queries;
using Booking.Domain;
using BookingEntity = Booking.Domain.Booking;

namespace Booking.UnitTests.Bookings;

public class MyBookingsQueryHandlerTests
{
    private readonly Mock<IBookingRepository> _bookingRepo = new();
    private readonly Guid _businessId = Guid.NewGuid();
    private readonly Guid _serviceId = Guid.NewGuid();
    private readonly Guid _staffId = Guid.NewGuid();
    private readonly Guid _customerId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();

    private MyBookingsQueryHandler CreateHandler() => new(_bookingRepo.Object);

    private BookingEntity Booking(DateTime start, DateTime end, BookingStatus status = BookingStatus.Confirmed) =>
        new(_businessId, _serviceId, _staffId, _customerId, start, end, 500, 0, "key-1");

    private List<BookingEntity> BookingsFor(Guid customerId, params DateTime[] starts)
    {
        var id = customerId;
        return starts
            .Select(s => new BookingEntity(_businessId, _serviceId, _staffId, id, s, s.AddHours(1), 500, 0, "key-1"))
            .ToList();
    }

    [Fact]
    public async Task Handle_AuthenticatedCustomer_ReturnsOrderedBookings()
    {
        var customer = new Customer(_businessId, "Jane", "Doe", "jane@example.com", userId: _userId);
        _bookingRepo.Setup(r => r.GetCustomerByUserIdAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customer);

        var bookings = BookingsFor(customer.Id,
            new DateTime(2026, 8, 15, 2, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 8, 14, 2, 0, 0, DateTimeKind.Utc));
        _bookingRepo.Setup(r => r.GetByCustomerAsync(customer.Id, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookings);

        var handler = CreateHandler();
        var result = await handler.Handle(new MyBookingsQuery(_userId), CancellationToken.None);

        result.Should().HaveCount(2);
        result.Select(b => b.Id).Should().Contain(bookings.Select(b => b.Id));
    }

    [Fact]
    public async Task Handle_UnknownUser_ThrowsUnauthorized()
    {
        _bookingRepo.Setup(r => r.GetCustomerByUserIdAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Customer?)null);

        var handler = CreateHandler();
        var act = async () => await handler.Handle(new MyBookingsQuery(_userId), CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Handle_GuestWithAccessCode_ReturnsBookings()
    {
        var guest = new Customer(_businessId, "Gia", "Guest", "gia@example.com");
        _bookingRepo.Setup(r => r.GetCustomerByAccessCodeAsync("ABCDEFGH", It.IsAny<CancellationToken>()))
            .ReturnsAsync(guest);
        _bookingRepo.Setup(r => r.GetByCustomerAsync(guest.Id, false, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<BookingEntity>());

        var handler = CreateHandler();
        var result = await handler.Handle(new MyBookingsQuery(null, "ABCDEFGH"), CancellationToken.None);

        result.Should().BeEmpty();
        _bookingRepo.Verify(r => r.GetByCustomerAsync(guest.Id, false, It.IsAny<CancellationToken>()), Times.Once);
    }
}