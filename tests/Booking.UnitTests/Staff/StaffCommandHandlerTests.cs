using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Booking.Application.Staff.Commands;
using Booking.Application.Staff.DTOs;
using Booking.Application.Staff.Handlers;
using Booking.Application.Staff.Interfaces;
using Booking.Domain;
using StaffEntity = Booking.Domain.Staff;

namespace Booking.UnitTests.Staff;

public class CreateStaffCommandHandlerTests
{
    private readonly Mock<IStaffRepository> _repository = new();
    private readonly NullLogger<CreateStaffCommandHandler> _logger = new();

    [Fact]
    public async Task Handle_ValidRequest_CreatesStaff()
    {
        var businessId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var request = new CreateStaffCommand(businessId,
            new StaffRequest("Juan", "Dela Cruz", "juan@example.com", "09171112222", true, 1, new[] { serviceId }));

        _repository.Setup(r => r.ServiceBelongsToBusinessAsync(businessId, serviceId, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _repository.Setup(r => r.GetServiceIdsForStaffAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(new[] { serviceId });

        var handler = new CreateStaffCommandHandler(_repository.Object, _logger);
        var result = await handler.Handle(request, CancellationToken.None);

        result.LastName.Should().Be("Dela Cruz");
        result.FullName.Should().Be("Juan Dela Cruz");
        result.BusinessId.Should().Be(businessId);
        result.ServiceIds.Should().Contain(serviceId);

        _repository.Verify(r => r.AddStaffAsync(It.Is<StaffEntity>(s => s.FullName == "Juan Dela Cruz"), It.IsAny<CancellationToken>()), Times.Once);
        _repository.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ServiceNotInBusiness_Throws()
    {
        var businessId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();
        var request = new CreateStaffCommand(businessId,
            new StaffRequest("Juan", "Dela Cruz", ServiceIds: new[] { serviceId }));

        _repository.Setup(r => r.ServiceBelongsToBusinessAsync(businessId, serviceId, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var handler = new CreateStaffCommandHandler(_repository.Object, _logger);

        var act = async () => await handler.Handle(request, CancellationToken.None);

        await act.Should().ThrowAsync<KeyNotFoundException>();
        _repository.Verify(r => r.AddStaffAsync(It.IsAny<StaffEntity>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}

public class SetStaffScheduleCommandHandlerTests
{
    private readonly Mock<IStaffRepository> _repository = new();
    private readonly NullLogger<SetStaffScheduleCommandHandler> _logger = new();

    [Fact]
    public async Task Handle_ValidSchedule_ReplacesExisting()
    {
        var businessId = Guid.NewGuid();
        var staffId = Guid.NewGuid();
        var oldSchedule = new StaffSchedule(staffId, DayOfWeek.Monday, new TimeSpan(9, 0, 0), new TimeSpan(17, 0, 0));
        var request = new SetStaffScheduleCommand(businessId, staffId,
            new ScheduleRequest(new[]
            {
                new ScheduleEntryRequest(DayOfWeek.Monday, new TimeSpan(9, 0, 0), new TimeSpan(17, 0, 0)),
                new ScheduleEntryRequest(DayOfWeek.Wednesday, new TimeSpan(9, 0, 0), new TimeSpan(12, 0, 0)),
            }));

        _repository.Setup(r => r.StaffExistsAsync(businessId, staffId, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _repository.Setup(r => r.GetSchedulesAsync(staffId, It.IsAny<CancellationToken>())).ReturnsAsync(new[] { oldSchedule });

        var handler = new SetStaffScheduleCommandHandler(_repository.Object, _logger);
        var result = await handler.Handle(request, CancellationToken.None);

        result.StaffId.Should().Be(staffId);
        result.Entries.Should().HaveCount(2);
        result.Entries.Should().Contain(e => e.DayOfWeek == DayOfWeek.Wednesday);

        _repository.Verify(r => r.DeleteAsync(oldSchedule, It.IsAny<CancellationToken>()), Times.Once);
        _repository.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_InvalidTimeRange_Throws()
    {
        var businessId = Guid.NewGuid();
        var staffId = Guid.NewGuid();
        var request = new SetStaffScheduleCommand(businessId, staffId,
            new ScheduleRequest(new[]
            {
                new ScheduleEntryRequest(DayOfWeek.Monday, new TimeSpan(17, 0, 0), new TimeSpan(9, 0, 0)),
            }));

        _repository.Setup(r => r.StaffExistsAsync(businessId, staffId, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _repository.Setup(r => r.GetSchedulesAsync(staffId, It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<StaffSchedule>());

        var handler = new SetStaffScheduleCommandHandler(_repository.Object, _logger);

        var act = async () => await handler.Handle(request, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*after start*");
    }

    [Fact]
    public async Task Handle_StaffNotFound_Throws()
    {
        var request = new SetStaffScheduleCommand(Guid.NewGuid(), Guid.NewGuid(),
            new ScheduleRequest(new[] { new ScheduleEntryRequest(DayOfWeek.Monday, new TimeSpan(9, 0, 0), new TimeSpan(17, 0, 0)) }));

        _repository.Setup(r => r.StaffExistsAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var handler = new SetStaffScheduleCommandHandler(_repository.Object, _logger);

        var act = async () => await handler.Handle(request, CancellationToken.None);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }
}

public class CreateOverrideCommandHandlerTests
{
    private readonly Mock<IStaffRepository> _repository = new();
    private readonly NullLogger<CreateOverrideCommandHandler> _logger = new();

    [Fact]
    public async Task Handle_TimeOffOverride_Creates()
    {
        var businessId = Guid.NewGuid();
        var staffId = Guid.NewGuid();
        var date = new DateOnly(2026, 8, 15);
        var request = new CreateOverrideCommand(businessId, staffId,
            new OverrideRequest(date, true, Reason: "Vacation"));

        _repository.Setup(r => r.StaffExistsAsync(businessId, staffId, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _repository.Setup(r => r.GetOverridesAsync(staffId, It.IsAny<CancellationToken>())).ReturnsAsync(new List<ScheduleOverride>());

        var handler = new CreateOverrideCommandHandler(_repository.Object, _logger);
        var result = await handler.Handle(request, CancellationToken.None);

        result.IsTimeOff.Should().BeTrue();
        result.Date.Should().Be(date);
        result.Reason.Should().Be("Vacation");
        _repository.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WorkingOverrideWithoutTimes_Throws()
    {
        var businessId = Guid.NewGuid();
        var staffId = Guid.NewGuid();
        var request = new CreateOverrideCommand(businessId, staffId,
            new OverrideRequest(new DateOnly(2026, 8, 15), false));

        _repository.Setup(r => r.StaffExistsAsync(businessId, staffId, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var handler = new CreateOverrideCommandHandler(_repository.Object, _logger);

        var act = async () => await handler.Handle(request, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*required*");
    }

    [Fact]
    public async Task Handle_DuplicateDate_Throws()
    {
        var businessId = Guid.NewGuid();
        var staffId = Guid.NewGuid();
        var date = new DateOnly(2026, 8, 15);
        var existing = new ScheduleOverride(staffId, date, true);
        var request = new CreateOverrideCommand(businessId, staffId, new OverrideRequest(date, true));

        _repository.Setup(r => r.StaffExistsAsync(businessId, staffId, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        _repository.Setup(r => r.GetOverridesAsync(staffId, It.IsAny<CancellationToken>())).ReturnsAsync(new[] { existing });

        var handler = new CreateOverrideCommandHandler(_repository.Object, _logger);

        var act = async () => await handler.Handle(request, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already exists*");
    }
}
