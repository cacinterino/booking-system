using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Booking.Application.Services.Commands;
using Booking.Application.Services.DTOs;
using Booking.Application.Services.Queries;

namespace Booking.Api.Controllers;

[ApiController]
[Route("api/services")]
public class ServicesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ServicesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [Authorize(Policy = "StaffOrAdmin")]
    public async Task<ActionResult<IReadOnlyList<ServiceResponse>>> GetServices([FromQuery] bool includeInactive = false)
    {
        var businessId = GetBusinessId();
        var query = new GetServicesQuery(businessId, includeInactive);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "StaffOrAdmin")]
    public async Task<ActionResult<ServiceResponse>> GetService(Guid id)
    {
        var businessId = GetBusinessId();
        var query = new GetServiceQuery(businessId, id);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ServiceResponse>> CreateService([FromBody] ServiceRequest request)
    {
        var businessId = GetBusinessId();
        var command = new CreateServiceCommand(businessId, request);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetService), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ServiceResponse>> UpdateService(Guid id, [FromBody] ServiceRequest request)
    {
        var businessId = GetBusinessId();
        var command = new UpdateServiceCommand(businessId, id, request);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteService(Guid id)
    {
        var businessId = GetBusinessId();
        var command = new DeleteServiceCommand(businessId, id);
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpGet("categories")]
    [Authorize(Policy = "StaffOrAdmin")]
    public async Task<ActionResult<IReadOnlyList<ServiceCategoryResponse>>> GetCategories()
    {
        var businessId = GetBusinessId();
        var query = new GetServiceCategoriesQuery(businessId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("categories")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ServiceCategoryResponse>> CreateCategory([FromBody] ServiceCategoryRequest request)
    {
        var businessId = GetBusinessId();
        var command = new CreateServiceCategoryCommand(businessId, request);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPut("categories/{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ServiceCategoryResponse>> UpdateCategory(Guid id, [FromBody] ServiceCategoryRequest request)
    {
        var businessId = GetBusinessId();
        var command = new UpdateServiceCategoryCommand(businessId, id, request);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpDelete("categories/{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var businessId = GetBusinessId();
        var command = new DeleteServiceCategoryCommand(businessId, id);
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