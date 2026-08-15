using MediatR;
using Booking.Application.Business.Interfaces;
using Booking.Application.Business.Queries;
using Booking.Application.Business.DTOs;
using Booking.Application.Staff.DTOs;

namespace Booking.Application.Business.Handlers;

public class GetMyWorkspaceQueryHandler : IRequestHandler<GetMyWorkspaceQuery, WorkspaceResponse>
{
    private readonly IBusinessRepository _repository;

    public GetMyWorkspaceQueryHandler(IBusinessRepository repository)
    {
        _repository = repository;
    }

    public async Task<WorkspaceResponse> Handle(GetMyWorkspaceQuery request, CancellationToken cancellationToken)
    {
        var staff = await _repository.GetStaffByUserIdAsync(request.UserId, cancellationToken);
        if (staff == null)
            throw new UnauthorizedAccessException("No staff record found for the current user");

        var business = await _repository.GetByIdAsync(staff.BusinessId, cancellationToken);
        if (business == null)
            throw new KeyNotFoundException("Business not found");

        var staffResponse = new StaffResponse(
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
            staff.Services.Select(s => s.ServiceId).ToList());

        var schedule = new ScheduleResponse(
            staff.Id,
            staff.Schedules
                .OrderBy(s => s.DayOfWeek)
                .Select(s => new ScheduleEntryResponse(s.Id, s.DayOfWeek, s.StartTime, s.EndTime, s.IsWorking))
                .ToList());

        var overrides = staff.Overrides
            .OrderBy(o => o.Date)
            .Select(o => new OverrideResponse(o.Id, o.Date, o.IsTimeOff, o.StartTime, o.EndTime, o.Reason))
            .ToList();

        return new WorkspaceResponse(staffResponse, schedule, overrides, business.Id, business.Name, business.Slug);
    }
}

public class GetPublicBusinessQueryHandler : IRequestHandler<GetPublicBusinessQuery, PublicBusinessResponse>
{
    private readonly IBusinessRepository _repository;

    public GetPublicBusinessQueryHandler(IBusinessRepository repository)
    {
        _repository = repository;
    }

    public async Task<PublicBusinessResponse> Handle(GetPublicBusinessQuery request, CancellationToken cancellationToken)
    {
        var business = await _repository.GetBySlugAsync(request.Slug, cancellationToken);
        if (business == null)
            throw new KeyNotFoundException("Business not found");

        var settings = business.Settings;
        return new PublicBusinessResponse(
            business.Id,
            business.Name,
            business.Slug,
            business.Description,
            business.Timezone,
            settings.RequireDeposit,
            settings.DepositAmount,
            settings.Currency,
            settings.AdvanceBookingDays,
            settings.SlotIntervalMinutes);
    }
}