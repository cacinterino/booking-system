using System.Reflection;
using FluentValidation;
using MediatR;

namespace Booking.Application.Pipeline;

/// <summary>
/// Validates a command's inner <c>Request</c> payload against any registered
/// FluentValidation validator. Commands without a <c>Request</c> property or
/// without a registered validator for the payload pass straight through.
/// Failures surface as a <see cref="ValidationException"/> mapped to 400 by the API.
/// </summary>
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private static readonly PropertyInfo? RequestProperty = typeof(TRequest).GetProperty("Request");
    private readonly IServiceProvider _services;

    public ValidationBehavior(IServiceProvider services)
    {
        _services = services;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var payload = RequestProperty?.GetValue(request);
        if (payload is null)
            return await next(cancellationToken);

        var validatorType = typeof(IValidator<>).MakeGenericType(payload.GetType());
        if (_services.GetService(validatorType) is not IValidator validator)
            return await next(cancellationToken);

        var result = validator.Validate(new ValidationContext<object>(payload));
        if (!result.IsValid)
            throw new ValidationException(result.Errors);

        return await next(cancellationToken);
    }
}
