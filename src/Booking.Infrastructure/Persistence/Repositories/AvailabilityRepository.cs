using Microsoft.EntityFrameworkCore;
using Booking.Application.Availability.Interfaces;
using Booking.Domain;
using Booking.Infrastructure.Persistence;
using BookingEntity = Booking.Domain.Booking;
using StaffEntity = Booking.Domain.Staff;

namespace Booking.Infrastructure.Persistence.Repositories;

public class AvailabilityRepository : IAvailabilityRepository
{
    private readonly BookingDbContext _context;

    public AvailabilityRepository(BookingDbContext context)
    {
        _context = context;
    }

    public async Task<Service?> GetServiceAsync(Guid businessId, Guid serviceId, CancellationToken cancellationToken)
    {
        return await _context.Services
            .FirstOrDefaultAsync(s => s.Id == serviceId && s.BusinessId == businessId, cancellationToken);
    }

    public async Task<BusinessSettings?> GetBusinessSettingsAsync(Guid businessId, CancellationToken cancellationToken)
    {
        var business = await _context.Businesses
            .AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken);
        return business?.Settings;
    }

    public async Task<IReadOnlyList<StaffEntity>> GetStaffForServiceAsync(Guid businessId, Guid serviceId, CancellationToken cancellationToken)
    {
        return await _context.Staff
            .Where(s => s.BusinessId == businessId && s.IsActive && s.Services.Any(ss => ss.ServiceId == serviceId))
            .OrderBy(s => s.DisplayOrder)
            .ThenBy(s => s.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<StaffSchedule>> GetSchedulesForStaffAsync(Guid staffId, CancellationToken cancellationToken)
    {
        return await _context.StaffSchedules
            .Where(s => s.StaffId == staffId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ScheduleOverride>> GetOverridesForStaffAsync(Guid staffId, CancellationToken cancellationToken)
    {
        return await _context.ScheduleOverrides
            .Where(o => o.StaffId == staffId)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BookingEntity>> GetBookingsAsync(Guid staffId, DateTime fromUtc, DateTime toUtc, CancellationToken cancellationToken)
    {
        return await _context.Bookings
            .Where(b => b.StaffId == staffId
                && b.StartTime < toUtc
                && b.EndTime > fromUtc
                && b.Status != BookingStatus.Cancelled
                && b.Status != BookingStatus.NoShow)
            .ToListAsync(cancellationToken);
    }
}