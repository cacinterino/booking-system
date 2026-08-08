using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Booking.Application.Bookings.Commands;
using Booking.Application.Bookings.DTOs;

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

    private Guid? GetOptionalUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return null;
        return userId;
    }
}