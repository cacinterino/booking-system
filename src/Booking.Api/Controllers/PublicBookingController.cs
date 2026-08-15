using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Booking.Application.Availability.DTOs;
using Booking.Application.Availability.Queries;
using Booking.Application.Business.DTOs;
using Booking.Application.Business.Interfaces;
using Booking.Application.Business.Queries;
using Booking.Application.Services.DTOs;
using Booking.Application.Services.Queries;
using Booking.Application.Staff.DTOs;
using Booking.Application.Staff.Handlers;
using Booking.Application.Staff.Queries;

namespace Booking.Api.Controllers;

[ApiController]
[Route("api/public/businesses/{slug}")]
public class PublicBookingController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IBusinessRepository _repository;

    public PublicBookingController(IMediator mediator, IBusinessRepository repository)
    {
        _mediator = mediator;
        _repository = repository;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PublicBusinessResponse>> GetBusiness(string slug, CancellationToken cancellationToken)
    {
        var query = new GetPublicBusinessQuery(slug);
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("services")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<ServiceResponse>>> GetServices(string slug, CancellationToken cancellationToken)
    {
        var businessId = await ResolveBusinessIdAsync(slug, cancellationToken);
        var query = new GetServicesQuery(businessId, IncludeInactive: false);
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("staff")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<PublicStaffResponse>>> GetStaff(
        string slug,
        [FromQuery] Guid? serviceId = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = await ResolveBusinessIdAsync(slug, cancellationToken);

        IReadOnlyList<StaffResponse> staff = serviceId.HasValue
            ? await _mediator.Send(new GetStaffByServiceQuery(businessId, serviceId.Value, IncludeInactive: false), cancellationToken)
            : await _mediator.Send(new GetStaffQuery(businessId, IncludeInactive: false), cancellationToken);

        return Ok(staff.Select(PublicStaffMapper.ToPublic).ToList());
    }

    [HttpGet("availability")]
    [AllowAnonymous]
    public async Task<ActionResult<AvailabilityResponse>> GetAvailability(
        string slug,
        [FromQuery] Guid serviceId,
        [FromQuery] DateOnly date,
        [FromQuery] Guid? staffId = null,
        CancellationToken cancellationToken = default)
    {
        var businessId = await ResolveBusinessIdAsync(slug, cancellationToken);
        var query = new GetAvailabilityQuery(businessId, serviceId, date, staffId);
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    private async Task<Guid> ResolveBusinessIdAsync(string slug, CancellationToken cancellationToken)
    {
        var business = await _repository.GetBySlugAsync(slug, cancellationToken);
        if (business == null)
            throw new KeyNotFoundException("Business not found");
        return business.Id;
    }
}
