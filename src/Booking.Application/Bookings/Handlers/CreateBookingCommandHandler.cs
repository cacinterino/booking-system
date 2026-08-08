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

public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, CreateBookingResult>
{
    private static readonly TimeSpan ManilaOffsetFromUtc = TimeSpan.FromHours(8);

    private readonly IBookingRepository _bookingRepo;
    private readonly IAvailabilityRepository _availabilityRepo;
    private readonly IAvailabilityCache _cache;
    private readonly IDateTimeProvider _clock;
    private readonly ILogger<CreateBookingCommandHandler> _logger;

    public CreateBookingCommandHandler(
        IBookingRepository bookingRepo,
        IAvailabilityRepository availabilityRepo,
        IAvailabilityCache cache,
        IDateTimeProvider clock,
        ILogger<CreateBookingCommandHandler> logger)
    {
        _bookingRepo = bookingRepo;
        _availabilityRepo = availabilityRepo;
        _cache = cache;
        _clock = clock;
        _logger = logger;
    }

    public async Task<CreateBookingResult> Handle(CreateBookingCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        Validate(request, command.IdempotencyKey, command.AuthenticatedUserId);

        var service = await _availabilityRepo.GetServiceAsync(request.BusinessId, request.ServiceId, cancellationToken);
        if (service == null)
            throw new KeyNotFoundException("Service not found");

        var settings = await _availabilityRepo.GetBusinessSettingsAsync(request.BusinessId, cancellationToken);
        if (settings == null)
            throw new KeyNotFoundException("Business not found");

        // Idempotency: a retry with the same key returns the existing booking (200).
        var existing = await _bookingRepo.GetByIdempotencyKeyAsync(request.BusinessId, command.IdempotencyKey, cancellationToken);
        if (existing != null)
            return new CreateBookingResult(BookingDtoMapper.ToResponse(existing), WasIdempotentRetry: true);

        // Resolve-or-create the customer (guest by email, authenticated by user id).
        var customer = await ResolveCustomerAsync(request, command.AuthenticatedUserId, cancellationToken);

        var startUtc = ToUtc(request.StartTime);
        var endUtc = startUtc.AddMinutes(service.DurationMinutes);

        await EnsureSlotAvailableAsync(request, service, settings, startUtc, endUtc, cancellationToken);

        var depositAmount = settings.RequireDeposit ? settings.DepositAmount : 0m;

        var booking = new BookingEntity(
            request.BusinessId,
            request.ServiceId,
            request.StaffId,
            customer.Id,
            startUtc,
            endUtc,
            service.Price,
            depositAmount,
            command.IdempotencyKey,
            request.Notes);

        booking.AddService(new BookingService(
            booking.Id,
            request.ServiceId,
            service.Name,
            service.DurationMinutes,
            service.Price));

        if (command.AuthenticatedUserId is null)
            booking.SetAccessCode(BookingDtoMapper.GenerateAccessCode());

        await _bookingRepo.AddAsync(booking, cancellationToken);

        try
        {
            await _bookingRepo.SaveChangesAsync(cancellationToken);
        }
        catch (IdempotencyConflictException)
        {
            // A concurrent request persisted the same key first; return that booking.
            var persisted = await _bookingRepo.GetByIdempotencyKeyAsync(request.BusinessId, command.IdempotencyKey, cancellationToken);
            if (persisted != null)
                return new CreateBookingResult(BookingDtoMapper.ToResponse(persisted), WasIdempotentRetry: true);
            throw;
        }
        // BookingConflictException (23P01 exclusion violation) propagates as 409.

        _cache.Invalidate(request.BusinessId, request.ServiceId, request.StaffId, startUtc, endUtc);

        _logger.LogInformation("Booking created {BookingId} slot {Slot} for service {ServiceId}", booking.Id, startUtc, request.ServiceId);
        return new CreateBookingResult(BookingDtoMapper.ToResponse(booking), WasIdempotentRetry: false);
    }

    private void Validate(CreateBookingRequest request, string idempotencyKey, Guid? authenticatedUserId)
    {
        if (string.IsNullOrWhiteSpace(idempotencyKey))
            throw new InvalidOperationException("Idempotency-Key header is required");

        var requestValidator = new CreateBookingRequestValidator();
        var requestResult = requestValidator.Validate(request);
        var failures = requestResult.Errors.Select(e => e.ErrorMessage).ToList();

        if (request.GuestContact is not null)
        {
            var guestValidator = new GuestContactRequestValidator();
            failures.AddRange(guestValidator.Validate(request.GuestContact).Errors.Select(e => e.ErrorMessage));
        }
        else if (authenticatedUserId is null)
        {
            failures.Add("Contact information is required");
        }

        if (failures.Count > 0)
            throw new InvalidOperationException(string.Join("; ", failures));
    }

    private async Task<Customer> ResolveCustomerAsync(
        CreateBookingRequest request,
        Guid? authenticatedUserId,
        CancellationToken cancellationToken)
    {
        if (authenticatedUserId.HasValue)
        {
            var customer = await _bookingRepo.GetCustomerByUserIdAsync(authenticatedUserId.Value, cancellationToken);
            if (customer == null)
                throw new InvalidOperationException("Authenticated customer does not have a profile yet");
            return customer;
        }

        var email = request.GuestContact?.Email?.Trim();
        var guest = await _bookingRepo.GetCustomerByEmailAsync(request.BusinessId, email!, cancellationToken);
        if (guest != null)
            return guest;

        var created = new Customer(
            request.BusinessId,
            request.GuestContact?.Name?.Trim() ?? "Guest",
            string.Empty,
            email!,
            request.GuestContact?.Phone,
            userId: null);
        await _bookingRepo.CreateCustomerAsync(created, cancellationToken);
        return created;
    }

    private async Task EnsureSlotAvailableAsync(
        CreateBookingRequest request,
        Service service,
        BusinessSettings settings,
        DateTime startUtc,
        DateTime endUtc,
        CancellationToken cancellationToken)
    {
        var manilaDate = DateOnly.FromDateTime((startUtc + ManilaOffsetFromUtc).Date);

        var staff = await _availabilityRepo.GetStaffForServiceAsync(request.BusinessId, request.ServiceId, cancellationToken);
        var member = staff.FirstOrDefault(s => s.Id == request.StaffId);
        if (member == null)
            throw new KeyNotFoundException("Staff does not offer this service");

        var window = await ResolveWorkingWindowAsync(member, manilaDate, cancellationToken);
        if (window == null)
            throw new BookingConflictException("The chosen slot is no longer available");

        var bookings = await _availabilityRepo.GetBookingsAsync(member.Id, startUtc.AddDays(-1), endUtc.AddDays(1), cancellationToken);
        var blocked = bookings
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

        var match = slots.FirstOrDefault(s =>
            s.StaffId == request.StaffId && s.StartUtc == startUtc && s.EndUtc == endUtc);

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