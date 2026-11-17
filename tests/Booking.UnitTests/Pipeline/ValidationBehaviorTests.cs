using FluentAssertions;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Booking.Application;
using Booking.Application.Auth.Commands;
using Booking.Application.Auth.DTOs;
using Booking.Application.Business.Commands;
using Booking.Application.Business.DTOs;
using Booking.Application.Pipeline;
using MediatR;

namespace Booking.UnitTests.Pipeline;

public class ValidationBehaviorTests
{
    private static RequestHandlerDelegate<object> Next(Action onInvoked) =>
        _ => { onInvoked(); return Task.FromResult<object>(new object()); };
    [Fact]
    public async Task Handle_ValidRequest_CallsNext()
    {
        var services = new ServiceCollection()
            .AddScoped<IValidator<RegisterRequest>, ValidRegisterValidator>()
            .BuildServiceProvider();
        var behavior = new ValidationBehavior<RegisterCommand, object>(services);

        var invoked = false;
        var request = new RegisterCommand(new RegisterRequest("a@b.com", "Password!1", "Ana", "Cruz"));

        await behavior.Handle(request, Next(() => invoked = true), CancellationToken.None);

        invoked.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_InvalidRequest_ThrowsValidationException()
    {
        var services = new ServiceCollection()
            .AddScoped<IValidator<RegisterRequest>, StrictRegisterValidator>()
            .BuildServiceProvider();
        var behavior = new ValidationBehavior<RegisterCommand, object>(services);

        var request = new RegisterCommand(new RegisterRequest("not-an-email", "short", "Ana", "Cruz"));

        var act = async () => await behavior.Handle(request, Next(() => { }), CancellationToken.None);

        var ex = await act.Should().ThrowAsync<ValidationException>();
        ex.Which.Errors.Should().Contain(e => e.PropertyName == "Email");
    }

    [Fact]
    public async Task Handle_CommandWithoutRequestProperty_SkipsValidation()
    {
        var services = new ServiceCollection().BuildServiceProvider();
        var behavior = new ValidationBehavior<NoRequestCommand, object>(services);

        var invoked = false;
        await behavior.Handle(new NoRequestCommand(), Next(() => invoked = true), CancellationToken.None);

        invoked.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_NoRegisteredValidator_SkipsValidation()
    {
        var services = new ServiceCollection().BuildServiceProvider();
        var behavior = new ValidationBehavior<RegisterCommand, object>(services);

        var invoked = false;
        await behavior.Handle(
            new RegisterCommand(new RegisterRequest("a@b.com", "Password!1", "Ana", "Cruz")),
            Next(() => invoked = true),
            CancellationToken.None);

        invoked.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_RegisterBusinessCommand_BadSlugThrows()
    {
        var services = new ServiceCollection()
            .AddScoped<IValidator<RegisterBusinessRequest>, ValidRegisterBusinessValidator>()
            .BuildServiceProvider();
        var behavior = new ValidationBehavior<RegisterBusinessCommand, object>(services);

        var request = new RegisterBusinessCommand(new RegisterBusinessRequest(
            "Nails Studio", "BAD SLUG!!!", "owner@test.com", "S3cure!Pass", "Maria", "Santos"));

        var act = async () => await behavior.Handle(request, Next(() => { }), CancellationToken.None);

        var ex = await act.Should().ThrowAsync<ValidationException>();
        ex.Which.Errors.Should().Contain(e => e.PropertyName == "BusinessSlug");
    }

    [Fact]
    public async Task Handle_RealRegisteredValidators_RejectBadAuthCommand()
    {
        var services = new ServiceCollection()
            .AddApplication()
            .BuildServiceProvider();
        var behavior = new ValidationBehavior<RegisterCommand, object>(services);

        var request = new RegisterCommand(new RegisterRequest("bad-email", "short", "", "Cruz"));

        var act = async () => await behavior.Handle(request, Next(() => { }), CancellationToken.None);

        var ex = await act.Should().ThrowAsync<ValidationException>();
        ex.Which.Errors.Select(e => e.PropertyName).Should().Contain(new[] { "Email", "Password", "FirstName" });
    }

    [Fact]
    public async Task Handle_RealValidators_ValidRegisterBusiness_Passes()
    {
        var services = new ServiceCollection()
            .AddApplication()
            .BuildServiceProvider();
        var behavior = new ValidationBehavior<RegisterBusinessCommand, object>(services);

        var invoked = false;
        var request = new RegisterBusinessCommand(new RegisterBusinessRequest(
            "Nails Studio", "nails-studio", "owner@test.com", "S3cure!Pass", "Maria", "Santos"));

        await behavior.Handle(request, Next(() => invoked = true), CancellationToken.None);

        invoked.Should().BeTrue();
    }

    private sealed class ValidRegisterValidator : AbstractValidator<RegisterRequest>
    {
        public ValidRegisterValidator()
        {
            RuleFor(x => x.Email).EmailAddress();
        }
    }

    private sealed class StrictRegisterValidator : AbstractValidator<RegisterRequest>
    {
        public StrictRegisterValidator()
        {
            RuleFor(x => x.Email).NotEmpty().EmailAddress().WithMessage("Invalid email");
            RuleFor(x => x.Password).MinimumLength(8).WithMessage("Password too short");
        }
    }

    private sealed class ValidRegisterBusinessValidator : AbstractValidator<RegisterBusinessRequest>
    {
        public ValidRegisterBusinessValidator()
        {
            RuleFor(x => x.BusinessSlug)
                .Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$").WithMessage("Bad slug");
        }
    }

    private sealed record NoRequestCommand : IRequest<object>;
}
