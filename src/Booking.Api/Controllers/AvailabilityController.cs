using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Booking.Application.Availability.DTOs;
using Booking.Application.Availability.Queries;

namespace Booking.Api.Controllers;

[ApiController]
[Route("api/availability")]
public class AvailabilityController : ControllerBase
{
    private readonly IMediator _mediator;

    public AvailabilityController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Policy = "StaffOrAdmin")]
    public async Task<ActionResult<AvailabilityResponse>> GetAvailability(
        [FromQuery] Guid serviceId,
        [FromQuery] DateOnly date,
        [FromQuery] Guid? staffId = null)
    {
        var businessId = GetBusinessId();
        var query = new GetAvailabilityQuery(businessId, serviceId, date, staffId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    private Guid GetBusinessId()
    {
        var businessIdClaim = User.FindFirst("businessId")?.Value;
        if (string.IsNullOrEmpty(businessIdClaim) || !Guid.TryParse(businessIdClaim, out var businessId))
            throw new UnauthorizedAccessException("User is not associated with a business");
        return businessId;
    }
}