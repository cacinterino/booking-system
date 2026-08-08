using Microsoft.Extensions.Logging;
using MediatR;
using Booking.Application.Auth.Interfaces;
using Booking.Application.Availability;
using Booking.Application.Availability.Interfaces;
using Booking.Application.Bookings.Commands;
using Booking.Application.Bookings.DTOs;
using Booking.Application.Bookings.Exceptions;
using Booking.Application.Bookings.Interfaces;
using Booking.Application.Bookings.Validators;
using Booking.Domain;
using BookingEntity = Booking.Domain.Booking;
using StaffEntity = Booking.Domain.Staff;

namespace Booking.Application.Bookings.Handlers;

public class SetBookingStatusCommandHandler : IRequestHandler<SetBookingStatusCommand, Unit>
{
    private readonly IBookingRepository _bookingRepo;
    private readonly IAvailabilityCache _cache;
    private readonly ILogger<SetBookingStatusCommandHandler> _logger;

    public SetBookingStatusCommandHandler(
        IBookingRepository bookingRepo,
        IAvailabilityCache cache,
        ILogger<SetBookingStatusCommandHandler> logger)
    {
        _bookingRepo = bookingRepo;
        _cache = cache;
        _logger = logger;
    }

    public async Task<Unit> Handle(SetBookingStatusCommand command, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepo.GetByIdAsync(command.BookingId, cancellationToken)
            ?? throw new KeyNotFoundException("Booking not found");

        await EnsureAuthorizedAsync(booking, command, cancellationToken);

        try
        {
            switch (command.Status)
            {
                case BookingStatus.Confirmed:
                    booking.Confirm();
                    break;
                case BookingStatus.Completed:
                    booking.Complete();
                    break;
                case BookingStatus.NoShow:
                    booking.MarkNoShow();
                    break;
                default:
                    throw new BookingConflictException($"Transition to {command.Status} is not supported");
            }
        }
        catch (InvalidOperationException ex)
        {
            throw new BookingConflictException($"Cannot set status to {command.Status}: {ex.Message}");
        }

        await _bookingRepo.SaveChangesAsync(cancellationToken);

        if (command.Status == BookingStatus.Confirmed)
            _cache.Invalidate(booking.BusinessId, booking.ServiceId, booking.StaffId, booking.StartTime, booking.EndTime);

        _logger.LogInformation("Booking {BookingId} status set to {Status}", booking.Id, booking.Status);
        return Unit.Value;
    }

    private async Task EnsureAuthorizedAsync(BookingEntity booking, SetBookingStatusCommand command, CancellationToken cancellationToken)
    {
        if (command.IsAdmin)
            return;

        var staff = await _bookingRepo.GetStaffByBusinessAndUserIdAsync(booking.BusinessId, command.AuthenticatedUserId, cancellationToken);
        if (staff is null)
            throw new UnauthorizedAccessException("Only staff of this business may change booking status");
    }
}

public class CancelBookingCommandHandler : IRequestHandler<CancelBookingCommand, Unit>
{
    private readonly IBookingRepository _bookingRepo;
    private readonly IAvailabilityCache _cache;
    private readonly ILogger<CancelBookingCommandHandler> _logger;

    public CancelBookingCommandHandler(
        IBookingRepository bookingRepo,
        IAvailabilityCache cache,
        ILogger<CancelBookingCommandHandler> logger)
    {
        _bookingRepo = bookingRepo;
        _cache = cache;
        _logger = logger;
    }

    public async Task<Unit> Handle(CancelBookingCommand command, CancellationToken cancellationToken)
    {
        var booking = await _bookingRepo.GetByIdAsync(command.BookingId, cancellationToken)
            ?? throw new KeyNotFoundException("Booking not found");

        await EnsureOwnerOrGuestAsync(booking, command.AuthenticatedUserId, command.AccessCode, cancellationToken);

        if (booking.Status == BookingStatus.Cancelled || booking.Status == BookingStatus.Completed ||
            booking.Status == BookingStatus.NoShow || booking.StartTime <= DateTime.UtcNow)
        {
            throw new BookingConflictException("Booking can no longer be cancelled");
        }

        booking.Cancel(command.Reason ?? string.Empty);
        await _bookingRepo.SaveChangesAsync(cancellationToken);

        _cache.Invalidate(booking.BusinessId, booking.ServiceId, booking.StaffId, booking.StartTime, booking.EndTime);
        _logger.LogInformation("Booking {BookingId} cancelled", booking.Id);
        return Unit.Value;
    }

    public async Task EnsureOwnerOrGuestAsync(
        BookingEntity booking,
        Guid? authenticatedUserId,
        string? accessCode,
        CancellationToken cancellationToken)
    {
        if (authenticatedUserId is not null)
        {
            var owner = await _bookingRepo.GetCustomerByUserIdAsync(authenticatedUserId.Value, cancellationToken);
            if (owner == null || owner.Id != booking.CustomerId)
                throw new UnauthorizedAccessException("You do not own this booking");
            return;
        }

        if (!string.IsNullOrEmpty(accessCode) && booking.AccessCode == accessCode)
            return;

        throw new UnauthorizedAccessException("Invalid access code");
    }
}

public class RescheduleBookingCommandHandler : IRequestHandler<RescheduleBookingCommand, BookingResponse>
{
    private static readonly TimeSpan ManilaOffsetFromUtc = TimeSpan.FromHours(8);

    private readonly IBookingRepository _bookingRepo;
    private readonly IAvailabilityRepository _availabilityRepo;
    private readonly IAvailabilityCache _cache;
    private readonly IDateTimeProvider _clock;
    private readonly ILogger<RescheduleBookingCommandHandler> _logger;

    public RescheduleBookingCommandHandler(
        IBookingRepository bookingRepo,
        IAvailabilityRepository availabilityRepo,
        IAvailabilityCache cache,
        IDateTimeProvider clock,
        ILogger<RescheduleBookingCommandHandler> logger)
    {
        _bookingRepo = bookingRepo;
        _availabilityRepo = availabilityRepo;
        _cache = cache;
        _clock = clock;
        _logger = logger;
    }

    public async Task<BookingResponse> Handle(RescheduleBookingCommand command, CancellationToken cancellationToken)
    {
        Validate(command.NewStartTime);

        var booking = await _bookingRepo.GetByIdAsync(command.BookingId, cancellationToken)
            ?? throw new KeyNotFoundException("Booking not found");

        await EnsureOwnerOrGuestAsync(booking, command.AuthenticatedUserId, command.AccessCode, cancellationToken);

        if (booking.Status != BookingStatus.Pending && booking.Status != BookingStatus.Confirmed)
            throw new BookingConflictException("Only pending or confirmed bookings can be rescheduled");

        var service = await _availabilityRepo.GetServiceAsync(booking.BusinessId, booking.ServiceId, cancellationToken)
            ?? throw new KeyNotFoundException("Service not found");
        var settings = await _availabilityRepo.GetBusinessSettingsAsync(booking.BusinessId, cancellationToken)
            ?? throw new KeyNotFoundException("Business not found");

        var startUtc = ToUtc(command.NewStartTime);
        var endUtc = startUtc.AddMinutes(service.DurationMinutes);

        await EnsureSlotAvailableAsync(booking.Id, booking.StaffId, startUtc, endUtc, service, settings, cancellationToken);

        var oldStart = booking.StartTime;
        var oldEnd = booking.EndTime;

        booking.Reschedule(startUtc, endUtc);
        await _bookingRepo.SaveChangesAsync(cancellationToken);

        _cache.Invalidate(booking.BusinessId, booking.ServiceId, booking.StaffId, oldStart, oldEnd);
        _cache.Invalidate(booking.BusinessId, booking.ServiceId, booking.StaffId, startUtc, endUtc);

        _logger.LogInformation("Booking {BookingId} rescheduled to {Start}", booking.Id, startUtc);
        return BookingDtoMapper.ToResponse(booking);
    }

    private async Task EnsureOwnerOrGuestAsync(
        BookingEntity booking,
        Guid? authenticatedUserId,
        string? accessCode,
        CancellationToken cancellationToken)
    {
        if (authenticatedUserId is not null)
        {
            var owner = await _bookingRepo.GetCustomerByUserIdAsync(authenticatedUserId.Value, cancellationToken);
            if (owner is not null && owner.Id == booking.CustomerId)
                return;

            var staff = await _bookingRepo.GetStaffByBusinessAndUserIdAsync(booking.BusinessId, authenticatedUserId.Value, cancellationToken);
            if (staff is not null)
                return;

            throw new UnauthorizedAccessException("Only the booking owner or a staff member of this business may reschedule");
        }

        if (!string.IsNullOrEmpty(accessCode) && booking.AccessCode == accessCode)
            return;

        throw new UnauthorizedAccessException("Invalid access code");
    }

    private static void Validate(DateTime newStartTime)
    {
        var validator = new RescheduleRequestValidator();
        var result = validator.Validate(new RescheduleBookingRequest(newStartTime));
        if (!result.IsValid)
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.ErrorMessage)));
    }

    private async Task EnsureSlotAvailableAsync(
        Guid bookingId,
        Guid staffId,
        DateTime startUtc,
        DateTime endUtc,
        Service service,
        BusinessSettings settings,
        CancellationToken cancellationToken)
    {
        var manilaDate = DateOnly.FromDateTime((startUtc + ManilaOffsetFromUtc).Date);

        var staff = await _availabilityRepo.GetStaffForServiceAsync(service.BusinessId, service.Id, cancellationToken);
        var member = staff.FirstOrDefault(s => s.Id == staffId)
            ?? throw new KeyNotFoundException("Staff does not offer this service");

        var window = await ResolveWorkingWindowAsync(member, manilaDate, cancellationToken);
        if (window == null)
            throw new BookingConflictException("The chosen slot is no longer available");

        var bookings = await _availabilityRepo.GetBookingsAsync(member.Id, startUtc.AddDays(-1), endUtc.AddDays(1), cancellationToken);
        var blocked = bookings
            .Where(b => b.Id != bookingId)
            .Select(b => new BlockedInterval(b.StaffId, b.StartTime, b.EndTime))
            .ToList();

        var inputs = new[]
        {
            new StaffAvailabilityInput(member.Id, member.FullName, window.Value.Start, window.Value.End, blocked)
        };

        var slots = AvailabilityEngine.Compute(
            manilaDate,
            service.DurationMinutes,
            settings.SlotIntervalMinutes,
            ManilaOffsetFromUtc,
            _clock.UtcNow,
            inputs);

        var match = slots.FirstOrDefault(s => s.StaffId == staffId && s.StartUtc == startUtc && s.EndUtc == endUtc);
        if (match == null)
            throw new BookingConflictException("The chosen slot is no longer available");
    }

    private async Task<(TimeSpan Start, TimeSpan End)?> ResolveWorkingWindowAsync(
        StaffEntity member,
        DateOnly date,
        CancellationToken cancellationToken)
    {
        var overrides = await _availabilityRepo.GetOverridesForStaffAsync(member.Id, cancellationToken);
        var overrideForDate = overrides.FirstOrDefault(o => o.Date == date);

        if (overrideForDate != null)
        {
            if (overrideForDate.IsTimeOff)
                return null;
            if (overrideForDate.StartTime.HasValue && overrideForDate.EndTime.HasValue)
                return (overrideForDate.StartTime.Value, overrideForDate.EndTime.Value);
        }

        var schedules = await _availabilityRepo.GetSchedulesForStaffAsync(member.Id, cancellationToken);
        var daySchedule = schedules.FirstOrDefault(s => s.DayOfWeek == date.DayOfWeek);

        if (daySchedule == null || !daySchedule.IsWorking)
            return null;

        return (daySchedule.StartTime, daySchedule.EndTime);
    }

    private static DateTime ToUtc(DateTime value)
    {
        return value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
        };
    }
}