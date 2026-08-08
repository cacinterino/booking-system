using FluentAssertions;
using Moq;
using Booking.Application.Bookings.DTOs;
using Booking.Application.Bookings.Handlers;
using Booking.Application.Bookings.Interfaces;
using Booking.Application.Bookings.Queries;
using Booking.Domain;
using BookingEntity = Booking.Domain.Booking;
using StaffEntity = Booking.Domain.Staff;

namespace Booking.UnitTests.Bookings;

public class ListBookingsQueryHandlerTests
{
    private readonly Mock<IBookingRepository> _bookingRepo = new();
    private readonly Guid _businessId = Guid.NewGuid();

    private ListBookingsQueryHandler CreateHandler() => new(_bookingRepo.Object);

    private BookingEntity Booking(DateTime start, BookingStatus status)
    {
        var booking = new BookingEntity(_businessId, Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(),
            start, start.AddHours(1), 500, 0, "key-1");
        if (status == BookingStatus.Confirmed) booking.Confirm();
        if (status == BookingStatus.Completed)
        {
            booking.Confirm();
            booking.Complete();
        }
        return booking;
    }

    [Fact]
    public async Task Handle_FiltersPassedToRepository()
    {
        var fromDate = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc);
        var toDate = new DateTime(2026, 8, 31, 0, 0, 0, DateTimeKind.Utc);
        var staffId = Guid.NewGuid();
        var page = 2;
        var pageSize = 10;

        _bookingRepo.Setup(r => r.GetByBusinessAsync(_businessId, BookingStatus.Confirmed, staffId, fromDate, toDate, page, pageSize, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<BookingEntity> { Booking(new DateTime(2026, 8, 14, 2, 0, 0, DateTimeKind.Utc), BookingStatus.Confirmed) });
        _bookingRepo.Setup(r => r.CountByBusinessAsync(_businessId, BookingStatus.Confirmed, staffId, fromDate, toDate, It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var handler = CreateHandler();
        var result = await handler.Handle(new ListBookingsQuery(_businessId, BookingStatus.Confirmed, staffId, fromDate, toDate, page, pageSize), CancellationToken.None);

        result.Items.Should().HaveCount(1);
        result.Total.Should().Be(1);
        result.Page.Should().Be(2);
        _bookingRepo.Verify(r => r.GetByBusinessAsync(_businessId, BookingStatus.Confirmed, staffId, fromDate, toDate, 2, pageSize, It.IsAny<CancellationToken>()), Times.Once);
    }
}

public class GetCalendarQueryHandlerTests
{
    private readonly Mock<IBookingRepository> _bookingRepo = new();
    private readonly Guid _businessId = Guid.NewGuid();
    private readonly Guid _staffUserId = Guid.NewGuid();

    private GetCalendarQueryHandler CreateHandler() => new(_bookingRepo.Object);

    private BookingEntity Booking(DateTime start, DateTime end)
    {
        var businessId = _businessId;
        var staffId = Guid.NewGuid();
        var customer = new Customer(businessId, "Cara", "Customer", "cara@example.com");
        var booking = new BookingEntity(businessId, Guid.NewGuid(), staffId, customer.Id, start, end, 500, 0, "key-1");
        booking.GetType().GetProperty("Customer")!.SetValue(booking, customer);
        return booking;
    }

    [Fact]
    public async Task Handle_Admin_ShowsAllStaff()
    {
        var staffId = Guid.NewGuid();
        _bookingRepo.Setup(r => r.GetCalendarAsync(_businessId, staffId, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<BookingEntity>());

        var handler = CreateHandler();
        var query = new GetCalendarQuery(_businessId, staffId, Guid.NewGuid(), IsAdmin: true, new DateOnly(2026, 8, 1), new DateOnly(2026, 8, 15));

        var result = await handler.Handle(query, CancellationToken.None);

        result.Should().BeEmpty();
        _bookingRepo.Verify(r => r.GetCalendarAsync(_businessId, staffId, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_StaffForcesOwnCalendar()
    {
        var staff = new StaffEntity(_businessId, "Sina", "Staff", "sina@example.com");
        _bookingRepo.Setup(r => r.GetStaffByBusinessAndUserIdAsync(_businessId, _staffUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(staff);

        _bookingRepo.Setup(r => r.GetCalendarAsync(_businessId, staff.Id, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<BookingEntity>());

        var handler = CreateHandler();
        var query = new GetCalendarQuery(_businessId, null, _staffUserId, IsAdmin: false, new DateOnly(2026, 8, 1), new DateOnly(2026, 8, 15));

        await handler.Handle(query, CancellationToken.None);

        _bookingRepo.Verify(r => r.GetCalendarAsync(_businessId, staff.Id, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_StaffRequestingAnotherStaff_Throws()
    {
        var staff = new StaffEntity(_businessId, "Sina", "Staff", "sina@example.com");
        _bookingRepo.Setup(r => r.GetStaffByBusinessAndUserIdAsync(_businessId, _staffUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(staff);

        var handler = CreateHandler();
        var query = new GetCalendarQuery(_businessId, Guid.NewGuid(), _staffUserId, IsAdmin: false, new DateOnly(2026, 8, 1), new DateOnly(2026, 8, 15));

        var act = async () => await handler.Handle(query, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Handle_StaffBuildsManilaDateTimeStamps()
    {
        var businessId = _businessId;
        var staff = new StaffEntity(businessId, "Sina", "Staff", "sina@example.com");
        var customer = new Customer(businessId, "Cara", "Customer", "cara@example.com");
        var service = new Service(businessId, "Haircut", 60, 500m);
        var booking = new BookingEntity(businessId, service.Id, staff.Id, customer.Id,
            new DateTime(2026, 8, 14, 2, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 8, 14, 3, 0, 0, DateTimeKind.Utc), 500, 0, "key-1");

        booking.GetType().GetProperty("Customer")!.SetValue(booking, customer);
        booking.GetType().GetProperty("Service")!.SetValue(booking, service);

        _bookingRepo.Setup(r => r.GetStaffByBusinessAndUserIdAsync(businessId, _staffUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(staff);
        _bookingRepo.Setup(r => r.GetCalendarAsync(businessId, staff.Id, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<BookingEntity> { booking });

        var handler = CreateHandler();
        var query = new GetCalendarQuery(businessId, null, _staffUserId, IsAdmin: false, new DateOnly(2026, 8, 14), new DateOnly(2026, 8, 14));

        var result = await handler.Handle(query, CancellationToken.None);

        var evt = result.Single();
        evt.Start.Should().Be("2026-08-14T10:00:00");
        evt.End.Should().Be("2026-08-14T11:00:00");
        evt.CustomerName.Should().Be("Cara Customer");
    }
}