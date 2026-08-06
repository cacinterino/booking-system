using Booking.Domain;
using StaffEntity = Booking.Domain.Staff;

namespace Booking.Application.Staff.Interfaces;

public interface IStaffRepository
{
    Task<IReadOnlyList<StaffEntity>> GetStaffAsync(Guid businessId, bool includeInactive, CancellationToken cancellationToken);
    Task<IReadOnlyList<StaffEntity>> GetStaffByServiceAsync(Guid businessId, Guid serviceId, bool includeInactive, CancellationToken cancellationToken);
    Task<StaffEntity?> GetStaffByIdAsync(Guid businessId, Guid id, CancellationToken cancellationToken);
    Task<StaffEntity?> GetStaffWithServicesAsync(Guid businessId, Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyList<StaffSchedule>> GetSchedulesAsync(Guid staffId, CancellationToken cancellationToken);
    Task<IReadOnlyList<ScheduleOverride>> GetOverridesAsync(Guid staffId, CancellationToken cancellationToken);
    Task<ScheduleOverride?> GetOverrideByIdAsync(Guid businessId, Guid staffId, Guid overrideId, CancellationToken cancellationToken);
    Task<bool> ServiceBelongsToBusinessAsync(Guid businessId, Guid serviceId, CancellationToken cancellationToken);
    Task<IReadOnlyList<Guid>> GetServiceIdsForStaffAsync(Guid staffId, CancellationToken cancellationToken);
    Task<bool> StaffExistsAsync(Guid businessId, Guid staffId, CancellationToken cancellationToken);
    Task AddStaffAsync(StaffEntity staff, CancellationToken cancellationToken);
    Task AddAsync<T>(T entity, CancellationToken cancellationToken) where T : class;
    Task UpdateAsync<T>(T entity, CancellationToken cancellationToken) where T : class;
    Task DeleteAsync<T>(T entity, CancellationToken cancellationToken) where T : class;
    Task SaveChangesAsync(CancellationToken cancellationToken);
}