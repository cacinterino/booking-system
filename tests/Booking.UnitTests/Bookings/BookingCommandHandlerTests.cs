using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Booking.Application.Auth.Interfaces;
using Booking.Application.Availability;
using Booking.Application.Availability.Interfaces;
using Booking.Application.Bookings.Commands;
using Booking.Application.Bookings.DTOs;
using Booking.Application.Bookings.Exceptions;
using Booking.Application.Bookings.Handlers;
using Booking.Application.Bookings.Interfaces;
using Booking.Domain;
using BookingEntity = Booking.Domain.Booking;
using StaffEntity = Booking.Domain.Staff;

namespace Booking.UnitTests.Bookings;

public class CreateBookingCommandHandlerTests
{
    private readonly Mock<IBookingRepository> _bookingRepo = new();
    private readonly Mock<IAvailabilityRepository> _availabilityRepo = new();
    private readonly Mock<IAvailabilityCache> _cache = new();
    private readonly Mock<IDateTimeProvider> _clock = new();
    private readonly string _idempotencyKey = "req-123";

    private readonly Guid _businessId = Guid.NewGuid();
    private readonly Guid _serviceId = Guid.NewGuid();
    private Guid _staffId;

    private CreateBookingCommandHandler CreateHandler() =>
        new(_bookingRepo.Object, _availabilityRepo.Object, _cache.Object, _clock.Object, NullLogger<CreateBookingCommandHandler>.Instance);

    private void SetupEngineBasics(IReadOnlyList<BookingEntity>? bookings = null)
    {
        _clock.Setup(c => c.UtcNow).Returns(DateTime.UtcNow);

        var service = new Service(_businessId, "Haircut", 60, 500m);
        var staff = new StaffEntity(_businessId, "Juan Dela Cruz", "juan@example.com", "09171112222");
        _staffId = staff.Id;
        var schedule = new StaffSchedule(_staffId, DayOfWeek.Friday, new TimeSpan(9, 0, 0), new TimeSpan(17, 0, 0));

        _availabilityRepo.Setup(r => r.GetServiceAsync(_businessId, _serviceId, It.IsAny<CancellationToken>())).ReturnsAsync(service);
        _availabilityRepo.Setup(r => r.GetBusinessSettingsAsync(_businessId, It.IsAny<CancellationToken>())).ReturnsAsync(new BusinessSettings());
        _availabilityRepo.Setup(r => r.GetStaffForServiceAsync(_businessId, _serviceId, It.IsAny<CancellationToken>())).ReturnsAsync(new[] { staff });
        _availabilityRepo.Setup(r => r.GetSchedulesForStaffAsync(_staffId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<StaffSchedule> { schedule });
        _availabilityRepo.Setup(r => r.GetOverridesForStaffAsync(_staffId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ScheduleOverride>());
        _availabilityRepo.Setup(r => r.GetBookingsAsync(_staffId, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookings ?? new List<BookingEntity>());
    }

    private CreateBookingRequest ValidRequest()
    {
        // 2026-08-14 10:00 Manila == 02:00 UTC
        var utcStart = new DateTime(2026, 8, 14, 2, 0, 0, DateTimeKind.Utc);
        return new CreateBookingRequest(
            _businessId,
            _serviceId,
            _staffId,
            utcStart,
            Notes: "Test",
            GuestContact: new GuestContactRequest("Juana Dela Cruz", "juana@example.com", "639170000000"));
    }

    [Fact]
    public async Task Handle_OverlappingBooking_ThrowsConflictNot500()
    {
        var bookingStart = new DateTime(2026, 8, 14, 2, 0, 0, DateTimeKind.Utc);
        var conflicting = new BookingEntity(_businessId, _serviceId, _staffId, Guid.NewGuid(),
            bookingStart, bookingStart.AddHours(1), 500, 0, "other-key");
        SetupEngineBasics(new[] { conflicting });

        var handler = CreateHandler();
        var request = new CreateBookingCommand(ValidRequest(), _idempotencyKey, null);

        var act = async () => await handler.Handle(request, CancellationToken.None);

        await act.Should().ThrowAsync<BookingConflictException>()
            .WithMessage("*no longer available*");
        _bookingRepo.Verify(r => r.AddAsync(It.IsAny<BookingEntity>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ValidSlot_CreatesBooking()
    {
        SetupEngineBasics();
        _bookingRepo.Setup(r => r.GetByIdempotencyKeyAsync(_businessId, _idempotencyKey, It.IsAny<CancellationToken>())).ReturnsAsync((BookingEntity?)null);
        _bookingRepo.Setup(r => r.GetCustomerByEmailAsync(_businessId, "juana@example.com", It.IsAny<CancellationToken>())).ReturnsAsync((Customer?)null);
        _bookingRepo.Setup(r => r.CreateCustomerAsync(It.IsAny<Customer>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Guid.NewGuid());

        var handler = CreateHandler();
        var request = new CreateBookingCommand(ValidRequest(), _idempotencyKey, null);

        var result = await handler.Handle(request, CancellationToken.None);

        result.WasIdempotentRetry.Should().BeFalse();
        result.Booking.Status.Should().Be(BookingStatus.Pending);
        result.Booking.AccessCode.Should().NotBeNullOrEmpty();
        _bookingRepo.Verify(r => r.AddAsync(It.IsAny<BookingEntity>(), It.IsAny<CancellationToken>()), Times.Once);
        _bookingRepo.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        _cache.Verify(r => r.Invalidate(_businessId, _serviceId, _staffId, It.IsAny<DateTime>(), It.IsAny<DateTime>()), Times.Once);
    }

    [Fact]
    public async Task Handle_IdempotentRetry_ReturnsExistingBookingWithoutDuplicate()
    {
        SetupEngineBasics();
        var existing = new BookingEntity(_businessId, _serviceId, _staffId, Guid.NewGuid(),
            new DateTime(2026, 8, 14, 2, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 8, 14, 3, 0, 0, DateTimeKind.Utc), 500, 0, _idempotencyKey);
        existing.SetAccessCode("ABC123");
        _bookingRepo.Setup(r => r.GetByIdempotencyKeyAsync(_businessId, _idempotencyKey, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        var handler = CreateHandler();
        var request = new CreateBookingCommand(ValidRequest(), _idempotencyKey, null);

        var result = await handler.Handle(request, CancellationToken.None);

        result.WasIdempotentRetry.Should().BeTrue();
        result.Booking.Id.Should().Be(existing.Id);
        _bookingRepo.Verify(r => r.AddAsync(It.IsAny<BookingEntity>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_GuestBooking_ResolvesOrCreatesCustomerByEmail()
    {
        SetupEngineBasics();
        _bookingRepo.Setup(r => r.GetByIdempotencyKeyAsync(_businessId, _idempotencyKey, It.IsAny<CancellationToken>())).ReturnsAsync((BookingEntity?)null);
        var existingCustomer = new Customer(_businessId, "Juana", "Dela Cruz", "juana@example.com");
        _bookingRepo.Setup(r => r.GetCustomerByEmailAsync(_businessId, "juana@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingCustomer);

        var handler = CreateHandler();
        var request = new CreateBookingCommand(ValidRequest(), _idempotencyKey, null);

        var result = await handler.Handle(request, CancellationToken.None);

        _bookingRepo.Verify(r => r.CreateCustomerAsync(It.IsAny<Customer>(), It.IsAny<CancellationToken>()), Times.Never);
        result.Booking.CustomerId.Should().Be(existingCustomer.Id);
    }
}

public class CancelBookingCommandHandlerTests
{
    private readonly Mock<IBookingRepository> _bookingRepo = new();
    private readonly Mock<IAvailabilityCache> _cache = new();
    private readonly Guid _businessId = Guid.NewGuid();
    private readonly Guid _customerId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _serviceId = Guid.NewGuid();
    private readonly Guid _staffId = Guid.NewGuid();

    private CancelBookingCommandHandler CreateHandler() =>
        new(_bookingRepo.Object, _cache.Object, NullLogger<CancelBookingCommandHandler>.Instance);

    private BookingEntity ConfirmedBooking()
    {
        var booking = new BookingEntity(_businessId, _serviceId, _staffId, _customerId,
            new DateTime(2026, 8, 14, 2, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 8, 14, 3, 0, 0, DateTimeKind.Utc), 500, 0, "key-1");
        booking.Confirm();
        return booking;
    }

    private void SetupOwner()
    {
        var customer = new Customer(_businessId, "Jane", "Doe", "jane@example.com");
        _bookingRepo.Setup(r => r.GetCustomerByUserIdAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customer);
        _ownerCustomerId = customer.Id;
    }

    private Guid _ownerCustomerId;

    private BookingEntity BookingForOwner() =>
        new(_businessId, _serviceId, _staffId, _ownerCustomerId,
            new DateTime(2026, 8, 14, 2, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 8, 14, 3, 0, 0, DateTimeKind.Utc), 500, 0, "key-1");

    [Fact]
    public async Task Handle_OwnerCancel_InvalidatesCacheAndSaves()
    {
        SetupOwner();
        var booking = BookingForOwner();
        _bookingRepo.Setup(r => r.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>())).ReturnsAsync(booking);

        var handler = CreateHandler();
        var command = new CancelBookingCommand(booking.Id, "Changed my mind", _userId);

        await handler.Handle(command, CancellationToken.None);

        booking.Status.Should().Be(BookingStatus.Cancelled);
        _bookingRepo.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        _cache.Verify(r => r.Invalidate(_businessId, _serviceId, _staffId, It.IsAny<DateTime>(), It.IsAny<DateTime>()), Times.Once);
    }

    [Fact]
    public async Task Handle_AlreadyCancelled_ThrowsConflict()
    {
        SetupOwner();
        var booking = BookingForOwner();
        booking.Cancel("first");
        _bookingRepo.Setup(r => r.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>())).ReturnsAsync(booking);

        var handler = CreateHandler();
        var command = new CancelBookingCommand(booking.Id, "again", _userId);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<BookingConflictException>();
        _bookingRepo.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NotOwner_ThrowsUnauthorized()
    {
        SetupOwner();
        var booking = BookingForOwner();
        _bookingRepo.Setup(r => r.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>())).ReturnsAsync(booking);

        var handler = CreateHandler();
        var command = new CancelBookingCommand(booking.Id, "takeover", Guid.NewGuid());

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
        _bookingRepo.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}

public class RescheduleBookingCommandHandlerTests
{
    private readonly Mock<IBookingRepository> _bookingRepo = new();
    private readonly Mock<IAvailabilityRepository> _availabilityRepo = new();
    private readonly Mock<IAvailabilityCache> _cache = new();
    private readonly Mock<IDateTimeProvider> _clock = new();
    private readonly Guid _businessId = Guid.NewGuid();
    private readonly Guid _customerId = Guid.NewGuid();
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _serviceId = Guid.NewGuid();
    private Guid _staffId;
    private Customer? _owner;

    private RescheduleBookingCommandHandler CreateHandler() =>
        new(_bookingRepo.Object, _availabilityRepo.Object, _cache.Object, _clock.Object, NullLogger<RescheduleBookingCommandHandler>.Instance);

    private BookingEntity Booking(DateTime start, DateTime end, bool confirmed = true)
    {
        var booking = new BookingEntity(_businessId, _serviceId, _staffId, _owner?.Id ?? _customerId, start, end, 500, 0, "key-1");
        if (confirmed) booking.Confirm();
        return booking;
    }

    private void SetupEngineFor(DateTime dateStartUtc, IReadOnlyList<BookingEntity>? bookings = null)
    {
        _clock.Setup(c => c.UtcNow).Returns(DateTime.UtcNow);

        var service = new Service(_businessId, "Haircut", 60, 500m);
        var staff = new StaffEntity(_businessId, "Juan Dela Cruz", "juan@example.com", "09171112222");
        _staffId = staff.Id;
        var local = dateStartUtc.AddHours(8);
        var schedule = new StaffSchedule(_staffId, local.DayOfWeek, new TimeSpan(9, 0, 0), new TimeSpan(17, 0, 0));

        _availabilityRepo.Setup(r => r.GetServiceAsync(_businessId, _serviceId, It.IsAny<CancellationToken>())).ReturnsAsync(service);
        _availabilityRepo.Setup(r => r.GetBusinessSettingsAsync(_businessId, It.IsAny<CancellationToken>())).ReturnsAsync(new BusinessSettings());
        _availabilityRepo.Setup(r => r.GetStaffForServiceAsync(service.BusinessId, service.Id, It.IsAny<CancellationToken>())).ReturnsAsync(new[] { staff });
        _availabilityRepo.Setup(r => r.GetSchedulesForStaffAsync(_staffId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<StaffSchedule> { schedule });
        _availabilityRepo.Setup(r => r.GetOverridesForStaffAsync(_staffId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<ScheduleOverride>());
        _availabilityRepo.Setup(r => r.GetBookingsAsync(_staffId, It.IsAny<DateTime>(), It.IsAny<DateTime>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(bookings ?? new List<BookingEntity>());
    }

    private void SetupOwner()
    {
        _owner = new Customer(_businessId, "Jane", "Doe", "jane@example.com");
        _bookingRepo.Setup(r => r.GetCustomerByUserIdAsync(_userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(_owner);
    }

    [Fact]
    public async Task Handle_NewSlotTaken_Throws409_OriginalUntouched()
    {
        var originalStart = new DateTime(2026, 8, 14, 2, 0, 0, DateTimeKind.Utc);
        var targetStart = new DateTime(2026, 8, 15, 2, 0, 0, DateTimeKind.Utc);
        var conflicting = new BookingEntity(_businessId, _serviceId, _staffId, Guid.NewGuid(),
            targetStart, targetStart.AddHours(1), 500, 0, "other");

        SetupOwner();
        SetupEngineFor(targetStart, new[] { conflicting });
        var booking = Booking(originalStart, originalStart.AddHours(1));
        _bookingRepo.Setup(r => r.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>())).ReturnsAsync(booking);

        var handler = CreateHandler();
        var command = new RescheduleBookingCommand(booking.Id, targetStart, _userId);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<BookingConflictException>();
        booking.StartTime.Should().Be(originalStart);
        booking.EndTime.Should().Be(originalStart.AddHours(1));
        _bookingRepo.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SlotFree_ReschedulesAndInvalidates()
    {
        var originalStart = new DateTime(2026, 8, 14, 2, 0, 0, DateTimeKind.Utc);
        var targetStart = new DateTime(2026, 8, 15, 2, 0, 0, DateTimeKind.Utc);
        SetupOwner();
        SetupEngineFor(targetStart, null);
        var booking = Booking(originalStart, originalStart.AddHours(1));
        _bookingRepo.Setup(r => r.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>())).ReturnsAsync(booking);

        var handler = CreateHandler();
        var command = new RescheduleBookingCommand(booking.Id, targetStart, _userId);

        var result = await handler.Handle(command, CancellationToken.None);

        booking.StartTime.Should().Be(targetStart);
        booking.EndTime.Should().Be(targetStart.AddHours(1));
        _bookingRepo.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        _cache.Verify(r => r.Invalidate(_businessId, _serviceId, _staffId, It.IsAny<DateTime>(), It.IsAny<DateTime>()), Times.Exactly(2));
    }
}

public class SetBookingStatusCommandHandlerTests
{
    private readonly Mock<IBookingRepository> _bookingRepo = new();
    private readonly Mock<IAvailabilityCache> _cache = new();
    private readonly Guid _businessId = Guid.NewGuid();
    private readonly Guid _serviceId = Guid.NewGuid();
    private readonly Guid _staffId = Guid.NewGuid();
    private readonly Guid _staffUserId = Guid.NewGuid();
    private readonly Guid _customerId = Guid.NewGuid();

    private SetBookingStatusCommandHandler CreateHandler() =>
        new(_bookingRepo.Object, _cache.Object, NullLogger<SetBookingStatusCommandHandler>.Instance);

    private BookingEntity Booking(BookingStatus status)
    {
        var booking = new BookingEntity(_businessId, _serviceId, _staffId, _customerId,
            new DateTime(2026, 8, 14, 2, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 8, 14, 3, 0, 0, DateTimeKind.Utc), 500, 0, "key-1");
        if (status == BookingStatus.Confirmed) booking.Confirm();
        return booking;
    }

    private void SetupStaff()
    {
        var staff = new StaffEntity(_businessId, "Sina", "Staff", "sina@example.com");
        _bookingRepo.Setup(r => r.GetStaffByBusinessAndUserIdAsync(_businessId, _staffUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(staff);
    }

    [Fact]
    public async Task Handle_ConfirmPending_Succeeds()
    {
        var booking = Booking(BookingStatus.Pending);
        _bookingRepo.Setup(r => r.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>())).ReturnsAsync(booking);
        SetupStaff();

        var handler = CreateHandler();
        var command = new SetBookingStatusCommand(booking.Id, BookingStatus.Confirmed, _staffUserId, IsAdmin: false);

        await handler.Handle(command, CancellationToken.None);

        booking.Status.Should().Be(BookingStatus.Confirmed);
        _bookingRepo.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_CompleteConfirmed_Succeeds()
    {
        var booking = Booking(BookingStatus.Confirmed);
        _bookingRepo.Setup(r => r.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>())).ReturnsAsync(booking);
        SetupStaff();

        var handler = CreateHandler();
        var command = new SetBookingStatusCommand(booking.Id, BookingStatus.Completed, _staffUserId, IsAdmin: false);

        await handler.Handle(command, CancellationToken.None);

        booking.Status.Should().Be(BookingStatus.Completed);
        _bookingRepo.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_PendingToCompleted_ThrowsConflict()
    {
        var booking = Booking(BookingStatus.Pending);
        _bookingRepo.Setup(r => r.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>())).ReturnsAsync(booking);
        SetupStaff();

        var handler = CreateHandler();
        var command = new SetBookingStatusCommand(booking.Id, BookingStatus.Completed, _staffUserId, IsAdmin: false);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<BookingConflictException>();
        _bookingRepo.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
        booking.Status.Should().Be(BookingStatus.Pending);
    }

    [Fact]
    public async Task Handle_StaffOfAnotherBusiness_ThrowsForbidden()
    {
        var booking = Booking(BookingStatus.Pending);
        _bookingRepo.Setup(r => r.GetByIdAsync(booking.Id, It.IsAny<CancellationToken>())).ReturnsAsync(booking);

        var otherBusinessId = Guid.NewGuid();
        var otherStaff = new StaffEntity(otherBusinessId, "Outsider", "Staff", "outsider@example.com");
        _bookingRepo.Setup(r => r.GetStaffByBusinessAndUserIdAsync(otherBusinessId, _staffUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(otherStaff);
        _bookingRepo.Setup(r => r.GetStaffByBusinessAndUserIdAsync(It.Is<Guid>(g => g == otherBusinessId), _staffUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(otherStaff);

        var handler = CreateHandler();
        var command = new SetBookingStatusCommand(booking.Id, BookingStatus.Confirmed, _staffUserId, IsAdmin: false);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
        _bookingRepo.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}