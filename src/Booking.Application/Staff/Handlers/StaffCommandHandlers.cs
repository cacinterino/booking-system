using MediatR;
using Microsoft.Extensions.Logging;
using Booking.Application.Staff.Commands;
using Booking.Application.Staff.DTOs;
using Booking.Application.Staff.Interfaces;
using Booking.Domain;
using StaffEntity = Booking.Domain.Staff;

namespace Booking.Application.Staff.Handlers;

public class CreateStaffCommandHandler : IRequestHandler<CreateStaffCommand, StaffResponse>
{
    private readonly IStaffRepository _repository;
    private readonly ILogger<CreateStaffCommandHandler> _logger;

    public CreateStaffCommandHandler(IStaffRepository repository, ILogger<CreateStaffCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<StaffResponse> Handle(CreateStaffCommand request, CancellationToken cancellationToken)
    {
        var req = request.Request;
        var staff = new StaffEntity(
            request.BusinessId,
            req.FirstName,
            req.LastName,
            req.Email,
            req.Phone);

        foreach (var serviceId in req.ServiceIds ?? Array.Empty<Guid>())
        {
            await EnsureServiceAsync(request.BusinessId, serviceId, cancellationToken);
            staff.AddService(serviceId);
        }

        await _repository.AddStaffAsync(staff, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Staff created: {FullName} for business {BusinessId}", staff.FullName, request.BusinessId);

        return await ToResponseAsync(staff, cancellationToken);
    }

    private async Task EnsureServiceAsync(Guid businessId, Guid serviceId, CancellationToken cancellationToken)
    {
        if (!await _repository.ServiceBelongsToBusinessAsync(businessId, serviceId, cancellationToken))
            throw new KeyNotFoundException($"Service {serviceId} not found in this business");
    }

    private async Task<StaffResponse> ToResponseAsync(StaffEntity staff, CancellationToken cancellationToken)
    {
        var serviceIds = await _repository.GetServiceIdsForStaffAsync(staff.Id, cancellationToken);
        return new StaffResponse(
            staff.Id,
            staff.FirstName,
            staff.LastName,
            staff.FullName,
            staff.Email,
            staff.Phone,
            staff.AvatarUrl,
            staff.BusinessId,
            staff.IsActive,
            staff.DisplayOrder,
            staff.UserId,
            serviceIds);
    }
}

public class UpdateStaffCommandHandler : IRequestHandler<UpdateStaffCommand, StaffResponse>
{
    private readonly IStaffRepository _repository;
    private readonly ILogger<UpdateStaffCommandHandler> _logger;

    public UpdateStaffCommandHandler(IStaffRepository repository, ILogger<UpdateStaffCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<StaffResponse> Handle(UpdateStaffCommand request, CancellationToken cancellationToken)
    {
        var staff = await _repository.GetStaffWithServicesAsync(request.BusinessId, request.Id, cancellationToken);
        if (staff == null)
            throw new KeyNotFoundException("Staff not found");

        var req = request.Request;
        staff.Update(req.FirstName, req.LastName, req.Email, req.Phone, req.IsActive, req.DisplayOrder);

        var currentServiceIds = staff.Services.Select(s => s.ServiceId).ToHashSet();
        var desiredServiceIds = (req.ServiceIds ?? Array.Empty<Guid>()).ToHashSet();

        foreach (var serviceId in desiredServiceIds.Except(currentServiceIds))
        {
            if (!await _repository.ServiceBelongsToBusinessAsync(request.BusinessId, serviceId, cancellationToken))
                throw new KeyNotFoundException($"Service {serviceId} not found in this business");
            staff.AddService(serviceId);
        }

        foreach (var serviceId in currentServiceIds.Except(desiredServiceIds))
            staff.RemoveService(serviceId);

        await _repository.UpdateAsync(staff, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Staff updated: {StaffId}", staff.Id);

        var serviceIds = await _repository.GetServiceIdsForStaffAsync(staff.Id, cancellationToken);
        return new StaffResponse(
            staff.Id,
            staff.FirstName,
            staff.LastName,
            staff.FullName,
            staff.Email,
            staff.Phone,
            staff.AvatarUrl,
            staff.BusinessId,
            staff.IsActive,
            staff.DisplayOrder,
            staff.UserId,
            serviceIds);
    }
}

public class DeleteStaffCommandHandler : IRequestHandler<DeleteStaffCommand, Unit>
{
    private readonly IStaffRepository _repository;
    private readonly ILogger<DeleteStaffCommandHandler> _logger;

    public DeleteStaffCommandHandler(IStaffRepository repository, ILogger<DeleteStaffCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Unit> Handle(DeleteStaffCommand request, CancellationToken cancellationToken)
    {
        var staff = await _repository.GetStaffByIdAsync(request.BusinessId, request.Id, cancellationToken);
        if (staff == null)
            throw new KeyNotFoundException("Staff not found");

        await _repository.DeleteAsync(staff, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Staff deleted: {StaffId}", staff.Id);
        return Unit.Value;
    }
}

public class SetStaffScheduleCommandHandler : IRequestHandler<SetStaffScheduleCommand, ScheduleResponse>
{
    private readonly IStaffRepository _repository;
    private readonly ILogger<SetStaffScheduleCommandHandler> _logger;

    public SetStaffScheduleCommandHandler(IStaffRepository repository, ILogger<SetStaffScheduleCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<ScheduleResponse> Handle(SetStaffScheduleCommand request, CancellationToken cancellationToken)
    {
        if (!await _repository.StaffExistsAsync(request.BusinessId, request.StaffId, cancellationToken))
            throw new KeyNotFoundException("Staff not found");

        var existing = await _repository.GetSchedulesAsync(request.StaffId, cancellationToken);
        foreach (var schedule in existing)
            await _repository.DeleteAsync(schedule, cancellationToken);

        var updated = new List<StaffSchedule>();
        foreach (var entry in request.Request.Entries)
        {
            if (entry.DayOfWeek is < DayOfWeek.Sunday or > DayOfWeek.Saturday)
                throw new InvalidOperationException("Invalid day of week");
            if (entry.IsWorking && entry.StartTime >= entry.EndTime)
                throw new InvalidOperationException("End time must be after start time");

            var schedule = new StaffSchedule(request.StaffId, entry.DayOfWeek, entry.StartTime, entry.EndTime, entry.IsWorking);
            await _repository.AddAsync(schedule, cancellationToken);
            updated.Add(schedule);
        }

        await _repository.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Schedule set for staff {StaffId}: {Count} days", request.StaffId, updated.Count);

        return new ScheduleResponse(request.StaffId, updated.Select(ToScheduleEntry).ToList());
    }

    private static ScheduleEntryResponse ToScheduleEntry(StaffSchedule s) =>
        new(s.Id, s.DayOfWeek, s.StartTime, s.EndTime, s.IsWorking);
}

public class CreateOverrideCommandHandler : IRequestHandler<CreateOverrideCommand, OverrideResponse>
{
    private readonly IStaffRepository _repository;
    private readonly ILogger<CreateOverrideCommandHandler> _logger;

    public CreateOverrideCommandHandler(IStaffRepository repository, ILogger<CreateOverrideCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<OverrideResponse> Handle(CreateOverrideCommand request, CancellationToken cancellationToken)
    {
        if (!await _repository.StaffExistsAsync(request.BusinessId, request.StaffId, cancellationToken))
            throw new KeyNotFoundException("Staff not found");

        var req = request.Request;
        if (!req.IsTimeOff)
        {
            if (!req.StartTime.HasValue || !req.EndTime.HasValue)
                throw new InvalidOperationException("Start and end time are required for a working override");
            if (req.StartTime >= req.EndTime)
                throw new InvalidOperationException("End time must be after start time");
        }

        var existing = await _repository.GetOverridesAsync(request.StaffId, cancellationToken);
        if (existing.Any(o => o.Date == req.Date))
            throw new InvalidOperationException("An override already exists for this date");

        var overrideEntity = req.IsTimeOff
            ? new ScheduleOverride(request.StaffId, req.Date, true, req.Reason)
            : new ScheduleOverride(request.StaffId, req.Date, req.StartTime!.Value, req.EndTime!.Value, req.Reason);

        await _repository.AddAsync(overrideEntity, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Override created for staff {StaffId} on {Date}", request.StaffId, req.Date);
        return ToOverride(overrideEntity);
    }

    private static OverrideResponse ToOverride(ScheduleOverride o) => new(o.Id, o.Date, o.IsTimeOff, o.StartTime, o.EndTime, o.Reason);
}

public class DeleteOverrideCommandHandler : IRequestHandler<DeleteOverrideCommand, Unit>
{
    private readonly IStaffRepository _repository;
    private readonly ILogger<DeleteOverrideCommandHandler> _logger;

    public DeleteOverrideCommandHandler(IStaffRepository repository, ILogger<DeleteOverrideCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Unit> Handle(DeleteOverrideCommand request, CancellationToken cancellationToken)
    {
        var overrideEntity = await _repository.GetOverrideByIdAsync(request.BusinessId, request.StaffId, request.OverrideId, cancellationToken);
        if (overrideEntity == null)
            throw new KeyNotFoundException("Override not found");

        await _repository.DeleteAsync(overrideEntity, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Override deleted: {OverrideId}", overrideEntity.Id);
        return Unit.Value;
    }
}