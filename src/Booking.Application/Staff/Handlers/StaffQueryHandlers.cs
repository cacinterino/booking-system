using MediatR;
using Booking.Application.Staff.DTOs;
using Booking.Application.Staff.Interfaces;
using Booking.Application.Staff.Queries;

namespace Booking.Application.Staff.Handlers;

public class GetStaffQueryHandler : IRequestHandler<GetStaffQuery, IReadOnlyList<StaffResponse>>
{
    private readonly IStaffRepository _repository;

    public GetStaffQueryHandler(IStaffRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<StaffResponse>> Handle(GetStaffQuery request, CancellationToken cancellationToken)
    {
        var staff = await _repository.GetStaffAsync(request.BusinessId, request.IncludeInactive, cancellationToken);
        var responses = new List<StaffResponse>();

        foreach (var s in staff)
        {
            var serviceIds = await _repository.GetServiceIdsForStaffAsync(s.Id, cancellationToken);
            responses.Add(new StaffResponse(
                s.Id,
                s.FirstName,
                s.LastName,
                s.FullName,
                s.Email,
                s.Phone,
                s.AvatarUrl,
                s.BusinessId,
                s.IsActive,
                s.DisplayOrder,
                s.UserId,
                serviceIds));
        }

        return responses;
    }
}

public class GetStaffByIdQueryHandler : IRequestHandler<GetStaffByIdQuery, StaffResponse>
{
    private readonly IStaffRepository _repository;

    public GetStaffByIdQueryHandler(IStaffRepository repository)
    {
        _repository = repository;
    }

    public async Task<StaffResponse> Handle(GetStaffByIdQuery request, CancellationToken cancellationToken)
    {
        var s = await _repository.GetStaffWithServicesAsync(request.BusinessId, request.Id, cancellationToken);
        if (s == null)
            throw new KeyNotFoundException("Staff not found");

        var serviceIds = await _repository.GetServiceIdsForStaffAsync(s.Id, cancellationToken);
        return new StaffResponse(
            s.Id,
            s.FirstName,
            s.LastName,
            s.FullName,
            s.Email,
            s.Phone,
            s.AvatarUrl,
            s.BusinessId,
            s.IsActive,
            s.DisplayOrder,
            s.UserId,
            serviceIds);
    }
}

public class GetStaffByServiceQueryHandler : IRequestHandler<GetStaffByServiceQuery, IReadOnlyList<StaffResponse>>
{
    private readonly IStaffRepository _repository;

    public GetStaffByServiceQueryHandler(IStaffRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<StaffResponse>> Handle(GetStaffByServiceQuery request, CancellationToken cancellationToken)
    {
        var staff = await _repository.GetStaffByServiceAsync(request.BusinessId, request.ServiceId, request.IncludeInactive, cancellationToken);
        var responses = new List<StaffResponse>();

        foreach (var s in staff)
        {
            var serviceIds = await _repository.GetServiceIdsForStaffAsync(s.Id, cancellationToken);
            responses.Add(new StaffResponse(
                s.Id,
                s.FirstName,
                s.LastName,
                s.FullName,
                s.Email,
                s.Phone,
                s.AvatarUrl,
                s.BusinessId,
                s.IsActive,
                s.DisplayOrder,
                s.UserId,
                serviceIds));
        }

        return responses;
    }
}

public class GetStaffScheduleQueryHandler : IRequestHandler<GetStaffScheduleQuery, ScheduleResponse>
{
    private readonly IStaffRepository _repository;

    public GetStaffScheduleQueryHandler(IStaffRepository repository)
    {
        _repository = repository;
    }

    public async Task<ScheduleResponse> Handle(GetStaffScheduleQuery request, CancellationToken cancellationToken)
    {
        if (!await _repository.StaffExistsAsync(request.BusinessId, request.StaffId, cancellationToken))
            throw new KeyNotFoundException("Staff not found");

        var schedules = await _repository.GetSchedulesAsync(request.StaffId, cancellationToken);
        var entries = schedules
            .OrderBy(s => s.DayOfWeek)
            .Select(s => new ScheduleEntryResponse(s.Id, s.DayOfWeek, s.StartTime, s.EndTime, s.IsWorking))
            .ToList();

        return new ScheduleResponse(request.StaffId, entries);
    }
}

public class GetStaffOverridesQueryHandler : IRequestHandler<GetStaffOverridesQuery, IReadOnlyList<OverrideResponse>>
{
    private readonly IStaffRepository _repository;

    public GetStaffOverridesQueryHandler(IStaffRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<OverrideResponse>> Handle(GetStaffOverridesQuery request, CancellationToken cancellationToken)
    {
        if (!await _repository.StaffExistsAsync(request.BusinessId, request.StaffId, cancellationToken))
            throw new KeyNotFoundException("Staff not found");

        var overrides = await _repository.GetOverridesAsync(request.StaffId, cancellationToken);
        return overrides
            .OrderBy(o => o.Date)
            .Select(o => new OverrideResponse(o.Id, o.Date, o.IsTimeOff, o.StartTime, o.EndTime, o.Reason))
            .ToList();
    }
}