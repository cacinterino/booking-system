using FluentValidation;
using Booking.Application.Staff.DTOs;

namespace Booking.Application.Staff.Validators;

public class StaffRequestValidator : AbstractValidator<StaffRequest>
{
    public StaffRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(100).WithMessage("First name cannot exceed 100 characters");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MaximumLength(100).WithMessage("Last name cannot exceed 100 characters");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("A valid email is required")
            .MaximumLength(255).WithMessage("Email cannot exceed 255 characters")
            .When(x => !string.IsNullOrEmpty(x.Email));

        RuleFor(x => x.Phone)
            .MaximumLength(50).WithMessage("Phone cannot exceed 50 characters");

        RuleFor(x => x.DisplayOrder)
            .GreaterThanOrEqualTo(0).WithMessage("Display order cannot be negative");
    }
}

public class ScheduleRequestValidator : AbstractValidator<ScheduleRequest>
{
    public ScheduleRequestValidator()
    {
        RuleFor(x => x.Entries)
            .NotNull().WithMessage("Schedule entries are required");

        RuleForEach(x => x.Entries)
            .Must(e => e.DayOfWeek is >= DayOfWeek.Sunday and <= DayOfWeek.Saturday)
            .WithMessage("Invalid day of week");

        RuleForEach(x => x.Entries)
            .Must(e => !e.IsWorking || e.StartTime < e.EndTime)
            .WithMessage("End time must be after start time for working days");
    }
}

public class OverrideRequestValidator : AbstractValidator<OverrideRequest>
{
    public OverrideRequestValidator()
    {
        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Date is required");

        RuleFor(x => x)
            .Must(o => o.IsTimeOff || (o.StartTime.HasValue && o.EndTime.HasValue))
            .WithMessage("Start and end time are required for a working override");

        RuleFor(x => x)
            .Must(o => o.IsTimeOff || o.StartTime < o.EndTime)
            .WithMessage("End time must be after start time");

        RuleFor(x => x.Reason)
            .MaximumLength(500).WithMessage("Reason cannot exceed 500 characters");
    }
}