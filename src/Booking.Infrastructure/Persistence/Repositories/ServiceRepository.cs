using Microsoft.EntityFrameworkCore;
using Booking.Application.Services.Interfaces;
using Booking.Domain;
using Booking.Infrastructure.Persistence;

namespace Booking.Infrastructure.Persistence.Repositories;

public class ServiceRepository : IServiceRepository
{
    private readonly BookingDbContext _context;

    public ServiceRepository(BookingDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Service>> GetServicesAsync(Guid businessId, bool includeInactive, CancellationToken cancellationToken)
    {
        var query = _context.Services
            .Include(s => s.Category)
            .Where(s => s.BusinessId == businessId);

        if (!includeInactive)
            query = query.Where(s => s.IsActive);

        return await query
            .OrderBy(s => s.DisplayOrder)
            .ThenBy(s => s.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Service?> GetServiceByIdAsync(Guid businessId, Guid id, CancellationToken cancellationToken)
    {
        return await _context.Services
            .Include(s => s.Category)
            .FirstOrDefaultAsync(s => s.BusinessId == businessId && s.Id == id, cancellationToken);
    }

    public async Task<bool> NameExistsAsync(Guid businessId, string name, Guid? excludeId, CancellationToken cancellationToken)
    {
        var nameLower = name.Trim().ToLowerInvariant();
        return await _context.Services
            .AnyAsync(s => s.BusinessId == businessId && s.Name.ToLower() == nameLower &&
                (excludeId == null || s.Id != excludeId), cancellationToken);
    }

    public async Task<IReadOnlyList<ServiceCategory>> GetCategoriesAsync(Guid businessId, CancellationToken cancellationToken)
    {
        return await _context.ServiceCategories
            .Where(c => c.BusinessId == businessId)
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<ServiceCategory?> GetCategoryByIdAsync(Guid businessId, Guid id, CancellationToken cancellationToken)
    {
        return await _context.ServiceCategories
            .FirstOrDefaultAsync(c => c.BusinessId == businessId && c.Id == id, cancellationToken);
    }

    public async Task<bool> CategoryNameExistsAsync(Guid businessId, string name, Guid? excludeId, CancellationToken cancellationToken)
    {
        var nameLower = name.Trim().ToLowerInvariant();
        return await _context.ServiceCategories
            .AnyAsync(c => c.BusinessId == businessId && c.Name.ToLower() == nameLower &&
                (excludeId == null || c.Id != excludeId), cancellationToken);
    }

    public async Task<int> GetServiceCountForCategoryAsync(Guid categoryId, CancellationToken cancellationToken)
    {
        return await _context.Services.CountAsync(s => s.CategoryId == categoryId, cancellationToken);
    }

    public async Task AddServiceAsync(Service service, CancellationToken cancellationToken)
    {
        await _context.Services.AddAsync(service, cancellationToken);
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