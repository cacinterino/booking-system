using Booking.Domain;
using StaffEntity = Booking.Domain.Staff;

namespace Booking.Application.Business.Interfaces;

public interface IBusinessRepository
{
    Task<Booking.Domain.Business?> GetByIdAsync(Guid businessId, CancellationToken cancellationToken);
    Task<Booking.Domain.Business?> GetBySlugAsync(string slug, CancellationToken cancellationToken);
    Task<bool> SlugExistsAsync(string slug, CancellationToken cancellationToken);
    Task AddBusinessAsync(Booking.Domain.Business business, CancellationToken cancellationToken);
    Task AddAsync<T>(T entity, CancellationToken cancellationToken) where T : class;
    Task UpdateAsync<T>(T entity, CancellationToken cancellationToken) where T : class;
    Task<BusinessInvitation?> GetInvitationByTokenAsync(string rawToken, CancellationToken cancellationToken);
    Task<BusinessInvitation?> GetInvitationByIdAsync(Guid invitationId, CancellationToken cancellationToken);
    Task<StaffEntity?> GetStaffByUserIdAsync(Guid userId, CancellationToken cancellationToken);
    Task<StaffEntity?> GetStaffByUserIdAndBusinessAsync(Guid userId, Guid businessId, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}