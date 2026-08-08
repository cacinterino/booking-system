using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Booking.Application.Business.Commands;
using Booking.Application.Business.DTOs;

namespace Booking.Api.Controllers;

[ApiController]
[Route("api/business")]
public class BusinessController : ControllerBase
{
    private readonly IMediator _mediator;

    public BusinessController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("{businessId:guid}/invitations")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<InvitationResponse>> InviteStaff(Guid businessId, [FromBody] InviteStaffRequest request)
    {
        var command = new InviteStaffCommand(businessId, request);
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}