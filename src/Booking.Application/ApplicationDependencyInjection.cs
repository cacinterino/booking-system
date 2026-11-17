using System.Reflection;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Booking.Application.Pipeline;

namespace Booking.Application;

public static class ApplicationDependencyInjection
{
    /// <summary>
    /// Registers MediatR pipeline behaviors and every FluentValidation validator
    /// in the Application assembly so commands are validated before their handler runs.
    /// </summary>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        var applicationAssembly = typeof(ApplicationDependencyInjection).Assembly;
        foreach (var validatorType in applicationAssembly.GetTypes())
        {
            var validatorInterface = validatorType.GetInterfaces()
                .FirstOrDefault(i => i.IsGenericType && i.GetGenericTypeDefinition() == typeof(IValidator<>));
            if (validatorInterface is null || validatorType.IsAbstract)
                continue;
            services.AddScoped(validatorInterface, validatorType);
        }

        return services;
    }
}
