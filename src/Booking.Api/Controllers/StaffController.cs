using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Booking.Application.Staff.Commands;
using Booking.Application.Staff.DTOs;
using Booking.Application.Staff.Queries;

namespace Booking.Api.Controllers;

[ApiController]
[Route("api/staff")]
public class StaffController : ControllerBase
{
    private readonly IMediator _mediator;

    public StaffController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Policy = "StaffOrAdmin")]
    public async Task<ActionResult<IReadOnlyList<StaffResponse>>> GetStaff([FromQuery] bool includeInactive = false)
    {
        var query = new GetStaffQuery(GetBusinessId(), includeInactive);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "StaffOrAdmin")]
    public async Task<ActionResult<StaffResponse>> GetStaffById(Guid id)
    {
        var query = new GetStaffByIdQuery(GetBusinessId(), id);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("by-service/{serviceId:guid}")]
    [Authorize(Policy = "StaffOrAdmin")]
    public async Task<ActionResult<IReadOnlyList<StaffResponse>>> GetStaffByService(Guid serviceId, [FromQuery] bool includeInactive = false)
    {
        var query = new GetStaffByServiceQuery(GetBusinessId(), serviceId, includeInactive);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<StaffResponse>> CreateStaff([FromBody] StaffRequest request)
    {
        var command = new CreateStaffCommand(GetBusinessId(), request);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetStaffById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<StaffResponse>> UpdateStaff(Guid id, [FromBody] StaffRequest request)
    {
        var command = new UpdateStaffCommand(GetBusinessId(), id, request);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteStaff(Guid id)
    {
        var command = new DeleteStaffCommand(GetBusinessId(), id);
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpGet("{staffId:guid}/schedule")]
    [Authorize(Policy = "StaffOrAdmin")]
    public async Task<ActionResult<ScheduleResponse>> GetSchedule(Guid staffId)
    {
        var query = new GetStaffScheduleQuery(GetBusinessId(), staffId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPut("{staffId:guid}/schedule")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ScheduleResponse>> SetSchedule(Guid staffId, [FromBody] ScheduleRequest request)
    {
        var command = new SetStaffScheduleCommand(GetBusinessId(), staffId, request);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet("{staffId:guid}/overrides")]
    [Authorize(Policy = "StaffOrAdmin")]
    public async Task<ActionResult<IReadOnlyList<OverrideResponse>>> GetOverrides(Guid staffId)
    {
        var query = new GetStaffOverridesQuery(GetBusinessId(), staffId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("{staffId:guid}/overrides")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<OverrideResponse>> CreateOverride(Guid staffId, [FromBody] OverrideRequest request)
    {
        var command = new CreateOverrideCommand(GetBusinessId(), staffId, request);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{staffId:guid}/overrides/{overrideId:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteOverride(Guid staffId, Guid overrideId)
    {
        var command = new DeleteOverrideCommand(GetBusinessId(), staffId, overrideId);
        await _mediator.Send(command);
        return NoContent();
    }

    private Guid GetBusinessId()
    {
        var businessIdClaim = User.FindFirst("businessId")?.Value;
        if (string.IsNullOrEmpty(businessIdClaim) || !Guid.TryParse(businessIdClaim, out var businessId))
            throw new UnauthorizedAccessException("User is not associated with a business");
        return businessId;
    }
}