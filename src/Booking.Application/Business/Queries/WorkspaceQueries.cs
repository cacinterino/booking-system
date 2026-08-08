using MediatR;
using Booking.Application.Business.DTOs;
using Booking.Application.Staff.DTOs;

namespace Booking.Application.Business.Queries;

public record GetMyWorkspaceQuery(Guid UserId) : IRequest<WorkspaceResponse>;

public record WorkspaceResponse(
    StaffResponse Staff,
    ScheduleResponse Schedule,
    IReadOnlyList<OverrideResponse> Overrides,
    Guid BusinessId,
    string BusinessName,
    string BusinessSlug
);