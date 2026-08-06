using Microsoft.EntityFrameworkCore;
using Booking.Application.Staff.Interfaces;
using Booking.Domain;
using Booking.Infrastructure.Persistence;

namespace Booking.Infrastructure.Persistence.Repositories;

public class StaffRepository : IStaffRepository
{
    private readonly BookingDbContext _context;

    public StaffRepository(BookingDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Staff>> GetStaffAsync(Guid businessId, bool includeInactive, CancellationToken cancellationToken)
    {
        var query = _context.Staff.Where(s => s.BusinessId == businessId);
        if (!includeInactive)
            query = query.Where(s => s.IsActive);

        return await query
            .OrderBy(s => s.DisplayOrder)
            .ThenBy(s => s.FirstName)
            .ThenBy(s => s.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Staff>> GetStaffByServiceAsync(Guid businessId, Guid serviceId, bool includeInactive, CancellationToken cancellationToken)
    {
        var query = _context.Staff
            .Where(s => s.BusinessId == businessId && s.Services.Any(ss => ss.ServiceId == serviceId));

        if (!includeInactive)
            query = query.Where(s => s.IsActive);

        return await query
            .OrderBy(s => s.DisplayOrder)
            .ThenBy(s => s.FirstName)
            .ToListAsync(cancellationToken);
    }

    public async Task<Staff?> GetStaffByIdAsync(Guid businessId, Guid id, CancellationToken cancellationToken)
    {
        return await _context.Staff
            .FirstOrDefaultAsync(s => s.BusinessId == businessId && s.Id == id, cancellationToken);
    }

    public async Task<Staff?> GetStaffWithServicesAsync(Guid businessId, Guid id, CancellationToken cancellationToken)
    {
        return await _context.Staff
            .Include(s => s.Services)
            .FirstOrDefaultAsync(s => s.BusinessId == businessId && s.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<StaffSchedule>> GetSchedulesAsync(Guid staffId, CancellationToken cancellationToken)
    {
        return await _context.StaffSchedules
            .Where(s => s.StaffId == staffId)
            .OrderBy(s => s.DayOfWeek)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ScheduleOverride>> GetOverridesAsync(Guid staffId, CancellationToken cancellationToken)
    {
        return await _context.ScheduleOverrides
            .Where(o => o.StaffId == staffId)
            .OrderBy(o => o.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<ScheduleOverride?> GetOverrideByIdAsync(Guid businessId, Guid staffId, Guid overrideId, CancellationToken cancellationToken)
    {
        return await _context.ScheduleOverrides
            .FirstOrDefaultAsync(o => o.Id == overrideId && o.StaffId == staffId &&
                _context.Staff.Any(s => s.Id == staffId && s.BusinessId == businessId), cancellationToken);
    }

    public async Task<bool> ServiceBelongsToBusinessAsync(Guid businessId, Guid serviceId, CancellationToken cancellationToken)
    {
        return await _context.Services.AnyAsync(s => s.Id == serviceId && s.BusinessId == businessId, cancellationToken);
    }

    public async Task<IReadOnlyList<Guid>> GetServiceIdsForStaffAsync(Guid staffId, CancellationToken cancellationToken)
    {
        return await _context.StaffServices
            .Where(ss => ss.StaffId == staffId)
            .Select(ss => ss.ServiceId)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> StaffExistsAsync(Guid businessId, Guid staffId, CancellationToken cancellationToken)
    {
        return await _context.Staff.AnyAsync(s => s.Id == staffId && s.BusinessId == businessId, cancellationToken);
    }

    public async Task AddStaffAsync(Staff staff, CancellationToken cancellationToken)
    {
        await _context.Staff.AddAsync(staff, cancellationToken);
    }

    public async Task AddAsync<T>(T entity, CancellationToken cancellationToken) where T : class
    {
        await _context.Set<T>().AddAsync(entity, cancellationToken);
    }

    public Task UpdateAsync<T>(T entity, CancellationToken cancellationToken) where T : class
    {
        _context.Set<T>().Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync<T>(T entity, CancellationToken cancellationToken) where T : class
    {
        _context.Set<T>().Remove(entity);
        return Task.CompletedTask;
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}