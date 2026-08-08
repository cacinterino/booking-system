using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Booking.Application.Bookings.Commands;
using Booking.Application.Bookings.DTOs;
using Booking.Application.Bookings.Queries;

namespace Booking.Api.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BookingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<BookingResponse>> Create([FromBody] CreateBookingRequest request)
    {
        var idempotencyKey = Request.Headers["Idempotency-Key"].ToString();

        var authenticatedUserId = GetOptionalUserId();
        var command = new CreateBookingCommand(request, idempotencyKey, authenticatedUserId);
        var result = await _mediator.Send(command);

        return result.WasIdempotentRetry
            ? Ok(result.Booking)
            : Created($"/api/bookings/{result.Booking.Id}", result.Booking);
    }

    [HttpPost("{id:guid}/cancel")]
    [AllowAnonymous]
    public async Task<ActionResult> Cancel(Guid id, [FromBody] CancelBookingRequest request)
    {
        var command = new CancelBookingCommand(id, request.Reason, GetOptionalUserId(), request.AccessCode);
        await _mediator.Send(command);
        return NoContent();
    }

[HttpPost("{id:guid}/reschedule")]
    [Authorize]
    public async Task<ActionResult<BookingResponse>> Reschedule(Guid id, [FromBody] RescheduleBookingRequest request)
    {
        var command = new RescheduleBookingCommand(id, request.StartTime, GetOptionalUserId(), request.AccessCode);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet("my-bookings")]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<BookingResponse>>> MyBookings([FromQuery] string? accessCode = null, [FromQuery] bool upcoming = false)
    {
        var query = new MyBookingsQuery(GetOptionalUserId(), accessCode, upcoming);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    private Guid? GetOptionalUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return null;
        return userId;
    }
}