using Booking.Domain;

namespace Booking.Application.Services.Interfaces;

public interface IServiceRepository
{
    Task<IReadOnlyList<Service>> GetServicesAsync(Guid businessId, bool includeInactive, CancellationToken cancellationToken);
    Task<Service?> GetServiceByIdAsync(Guid businessId, Guid id, CancellationToken cancellationToken);
    Task<bool> NameExistsAsync(Guid businessId, string name, Guid? excludeId, CancellationToken cancellationToken);
    Task<IReadOnlyList<ServiceCategory>> GetCategoriesAsync(Guid businessId, CancellationToken cancellationToken);
    Task<ServiceCategory?> GetCategoryByIdAsync(Guid businessId, Guid id, CancellationToken cancellationToken);
    Task<bool> CategoryNameExistsAsync(Guid businessId, string name, Guid? excludeId, CancellationToken cancellationToken);
    Task<int> GetServiceCountForCategoryAsync(Guid categoryId, CancellationToken cancellationToken);
    Task AddServiceAsync(Service service, CancellationToken cancellationToken);
    Task AddAsync<T>(T entity, CancellationToken cancellationToken) where T : class;
    Task UpdateAsync<T>(T entity, CancellationToken cancellationToken) where T : class;
    Task DeleteAsync<T>(T entity, CancellationToken cancellationToken) where T : class;
    Task SaveChangesAsync(CancellationToken cancellationToken);
}