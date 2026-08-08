using MediatR;
using Booking.Application.Staff.DTOs;

namespace Booking.Application.Staff.Queries;

public record GetStaffQuery(
    Guid BusinessId,
    bool IncludeInactive = false
) : IRequest<IReadOnlyList<StaffResponse>>;

public record GetStaffByIdQuery(
    Guid BusinessId,
    Guid Id
) : IRequest<StaffResponse>;

public record GetStaffByServiceQuery(
    Guid BusinessId,
    Guid ServiceId,
    bool IncludeInactive = false
) : IRequest<IReadOnlyList<StaffResponse>>;

public record GetStaffScheduleQuery(
    Guid BusinessId,
    Guid StaffId
) : IRequest<ScheduleResponse>;

public record GetStaffOverridesQuery(
    Guid BusinessId,
    Guid StaffId
) : IRequest<IReadOnlyList<OverrideResponse>>;