using Microsoft.Extensions.Caching.Memory;
using MediatR;
using Booking.Application.Auth.Interfaces;
using Booking.Application.Availability;
using Booking.Application.Availability.DTOs;
using Booking.Application.Availability.Interfaces;
using Booking.Application.Availability.Queries;
using StaffEntity = Booking.Domain.Staff;

namespace Booking.Application.Availability.Handlers;

public class GetAvailabilityQueryHandler : IRequestHandler<GetAvailabilityQuery, AvailabilityResponse>
{
    private static readonly TimeSpan ManilaOffsetFromUtc = TimeSpan.FromHours(8);
    private const string CacheRegion = "availability";

    private readonly IAvailabilityRepository _repository;
    private readonly IDateTimeProvider _clock;
    private readonly IMemoryCache _cache;

    public GetAvailabilityQueryHandler(
        IAvailabilityRepository repository,
        IDateTimeProvider clock,
        IMemoryCache cache)
    {
        _repository = repository;
        _clock = clock;
        _cache = cache;
    }

    public async Task<AvailabilityResponse> Handle(GetAvailabilityQuery request, CancellationToken cancellationToken)
    {
        var service = await _repository.GetServiceAsync(request.BusinessId, request.ServiceId, cancellationToken);
        if (service == null)
            throw new KeyNotFoundException("Service not found");

        var settings = await _repository.GetBusinessSettingsAsync(request.BusinessId, cancellationToken);
        if (settings == null)
            throw new KeyNotFoundException("Business not found");

        var cacheKey = $"{CacheRegion}:{request.BusinessId}:{request.ServiceId}:{(request.StaffId?.ToString() ?? "any")}:{request.Date}";
        if (_cache.TryGetValue(cacheKey, out AvailabilityResponse? cached) && cached != null)
            return cached;

        var offset = ManilaOffsetFromUtc;
        var utcNow = DateTime.SpecifyKind(_clock.UtcNow, DateTimeKind.Utc);
        var dayStartLocal = request.Date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Unspecified);
        var utcDayStart = DateTime.SpecifyKind(dayStartLocal - offset, DateTimeKind.Utc);
        var utcDayEnd = utcDayStart.AddDays(1);

        var staff = await GetEligibleStaffAsync(request, cancellationToken);
        var staffInputs = new List<StaffAvailabilityInput>(staff.Count);

        foreach (var member in staff)
        {
            var window = await ResolveWorkingWindowAsync(member, request.Date, cancellationToken);
            if (window == null)
                continue;

            var bookings = await _repository.GetBookingsAsync(member.Id, utcDayStart, utcDayEnd, cancellationToken);
            var blocked = bookings
                .Select(b => new BlockedInterval(b.StaffId, b.StartTime, b.EndTime))
                .ToList();

            staffInputs.Add(new StaffAvailabilityInput(
                member.Id,
                member.FullName,
                window.Value.Start,
                window.Value.End,
                blocked));
        }

        var slots = AvailabilityEngine.Compute(
            request.Date,
            service.DurationMinutes,
            settings.SlotIntervalMinutes,
            offset,
            utcNow,
            staffInputs);

        var localSlots = slots.Select(s => new AvailableSlotResponse(
            s.StaffId,
            s.StaffName,
            (s.StartUtc + offset).ToString("yyyy-MM-ddTHH:mm:ss"),
            (s.EndUtc + offset).ToString("yyyy-MM-ddTHH:mm:ss"),
            s.StartUtc,
            s.EndUtc)).ToList();

        var response = new AvailabilityResponse(
            request.ServiceId,
            service.Name,
            request.Date,
            service.DurationMinutes,
            localSlots);

        _cache.Set(cacheKey, response, TimeSpan.FromMinutes(1));
        return response;
    }

    private async Task<IReadOnlyList<StaffEntity>> GetEligibleStaffAsync(GetAvailabilityQuery request, CancellationToken cancellationToken)
    {
        if (request.StaffId.HasValue)
        {
            var all = await _repository.GetStaffForServiceAsync(request.BusinessId, request.ServiceId, cancellationToken);
            return all.Where(s => s.Id == request.StaffId.Value).ToList();
        }

        return await _repository.GetStaffForServiceAsync(request.BusinessId, request.ServiceId, cancellationToken);
    }

    private async Task<(TimeSpan Start, TimeSpan End)?> ResolveWorkingWindowAsync(
        StaffEntity member,
        DateOnly date,
        CancellationToken cancellationToken)
    {
        var overrideDay = await _repository.GetOverridesForStaffAsync(member.Id, cancellationToken);
        var overrideForDate = overrideDay.FirstOrDefault(o => o.Date == date);

        if (overrideForDate != null)
        {
            if (overrideForDate.IsTimeOff)
                return null;
            if (overrideForDate.StartTime.HasValue && overrideForDate.EndTime.HasValue)
                return (overrideForDate.StartTime.Value, overrideForDate.EndTime.Value);
        }

        var schedule = await _repository.GetSchedulesForStaffAsync(member.Id, cancellationToken);
        var daySchedule = schedule.FirstOrDefault(s => s.DayOfWeek == date.DayOfWeek);

        if (daySchedule == null || !daySchedule.IsWorking)
            return null;

        return (daySchedule.StartTime, daySchedule.EndTime);
    }
}