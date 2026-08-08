using MediatR;
using Booking.Application.Staff.DTOs;

namespace Booking.Application.Staff.Commands;

public record CreateStaffCommand(
    Guid BusinessId,
    StaffRequest Request
) : IRequest<StaffResponse>;

public record UpdateStaffCommand(
    Guid BusinessId,
    Guid Id,
    StaffRequest Request
) : IRequest<StaffResponse>;

public record DeleteStaffCommand(
    Guid BusinessId,
    Guid Id
) : IRequest<Unit>;

public record SetStaffScheduleCommand(
    Guid BusinessId,
    Guid StaffId,
    ScheduleRequest Request
) : IRequest<ScheduleResponse>;

public record CreateOverrideCommand(
    Guid BusinessId,
    Guid StaffId,
    OverrideRequest Request
) : IRequest<OverrideResponse>;

public record DeleteOverrideCommand(
    Guid BusinessId,
    Guid StaffId,
    Guid OverrideId
) : IRequest<Unit>;