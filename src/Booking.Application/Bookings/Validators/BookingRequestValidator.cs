using FluentValidation;
using Booking.Application.Bookings.DTOs;

namespace Booking.Application.Bookings.Validators;

public class CreateBookingRequestValidator : AbstractValidator<CreateBookingRequest>
{
    public CreateBookingRequestValidator()
    {
        RuleFor(x => x.BusinessId)
            .NotEmpty().WithMessage("Business is required");

        RuleFor(x => x.ServiceId)
            .NotEmpty().WithMessage("Service is required");

        RuleFor(x => x.StaffId)
            .NotEmpty().WithMessage("Staff member is required");

        RuleFor(x => x.StartTime)
            .Must(BeOnSlotBoundary).WithMessage("Start time must align to 5-minute slot boundaries")
            .Must(BeInFuture).WithMessage("Start time must be in the future");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes cannot exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Notes));

        RuleFor(x => x.GuestContact)
            .NotNull().WithMessage("Contact information is required for guest bookings");
    }

    private static bool BeInFuture(DateTime startTime)
    {
        return startTime > DateTime.UtcNow;
    }

    private static bool BeOnSlotBoundary(DateTime startTime)
    {
        return startTime.Minute % 5 == 0 && startTime.Second == 0 && startTime.Millisecond == 0;
    }
}

public class GuestContactRequestValidator : AbstractValidator<GuestContactRequest?>
{
    public GuestContactRequestValidator()
    {
        RuleFor(x => x!.Name)
            .NotEmpty().WithMessage("Guest name is required")
            .MaximumLength(100).WithMessage("Guest name cannot exceed 100 characters");

        RuleFor(x => x!.Email)
            .NotEmpty().WithMessage("Guest email is required")
            .EmailAddress().WithMessage("Invalid email format");

        RuleFor(x => x!.Phone)
            .MaximumLength(20).WithMessage("Phone cannot exceed 20 characters")
            .When(x => x is not null && !string.IsNullOrEmpty(x.Phone));
    }
}

public class RescheduleRequestValidator : AbstractValidator<RescheduleBookingRequest>
{
    public RescheduleRequestValidator()
    {
        RuleFor(x => x.StartTime)
            .Must(IsInFuture).WithMessage("Start time must be in the future")
            .Must(IsOnSlotBoundary).WithMessage("Start time must align on 5-minute slot boundaries");
    }

    private static bool IsInFuture(DateTime startTime) => startTime > DateTime.UtcNow;

    private static bool IsOnSlotBoundary(DateTime startTime)
        => startTime.Minute % 5 == 0 && startTime.Second == 0 && startTime.Millisecond == 0;
}