using System.Net;
using Microsoft.AspNetCore.Diagnostics;
using Booking.Application.Bookings.Exceptions;

namespace Booking.Api.Middleware;

public static class ProblemDetailsExceptionExtensions
{
    /// <summary>
    /// Maps domain exceptions to RFC 7807 problem details with the contract's
    /// status code shape: 400 validation, 404 not found, 409 conflict.
    /// Anything else falls through to the default 500 response.
    /// </summary>
    public static IApplicationBuilder UseProblemDetailsExceptionHandler(this IApplicationBuilder app)
    {
        return app.UseExceptionHandler(errorApp =>
        {
errorApp.Run(async context =>
                {
                    var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;

                var (status, title, detail) = exception switch
                {
                    BookingConflictException => (HttpStatusCode.Conflict, "Conflict", exception.Message),
                    KeyNotFoundException => (HttpStatusCode.NotFound, "Not Found", exception.Message),
                    InvalidOperationException => (HttpStatusCode.BadRequest, "Bad Request", exception.Message),
                    _ => (HttpStatusCode.InternalServerError, "Internal Server Error", "An unexpected error occurred.")
                };

                context.Response.StatusCode = (int)status;
                context.Response.ContentType = "application/problem+json";
                await context.Response.WriteAsJsonAsync(new
                {
                    type = "about:blank",
                    title,
                    status = (int)status,
                    detail,
                    instance = context.Request.Path.ToString()
                });
            });
        });
    }
}