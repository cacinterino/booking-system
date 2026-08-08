using Booking.Domain;
using BookingEntity = Booking.Domain.Booking;
using StaffEntity = Booking.Domain.Staff;

namespace Booking.Application.Bookings.Interfaces;

public interface IBookingRepository
{
    Task<BookingEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<BookingEntity?> GetByIdempotencyKeyAsync(Guid businessId, string idempotencyKey, CancellationToken cancellationToken);
    Task<IReadOnlyList<BookingEntity>> GetByCustomerAsync(Guid customerId, bool upcomingOnly, CancellationToken cancellationToken);
    Task<IReadOnlyList<BookingEntity>> GetByBusinessAsync(
        Guid businessId,
        BookingStatus? status,
        Guid? staffId,
        DateTime? fromDate,
        DateTime? toDate,
        int page,
        int pageSize,
        CancellationToken cancellationToken);
    Task<int> CountByBusinessAsync(
        Guid businessId,
        BookingStatus? status,
        Guid? staffId,
        DateTime? fromDate,
        DateTime? toDate,
        CancellationToken cancellationToken);
    Task<IReadOnlyList<BookingEntity>> GetCalendarAsync(
        Guid businessId,
        Guid? staffId,
        DateTime fromUtc,
        DateTime toUtc,
        CancellationToken cancellationToken);
    Task<Customer?> GetCustomerByEmailAsync(Guid businessId, string email, CancellationToken cancellationToken);
    Task<Customer?> GetCustomerByUserIdAsync(Guid userId, CancellationToken cancellationToken);
    Task<Guid> CreateCustomerAsync(Customer customer, CancellationToken cancellationToken);
    Task<StaffEntity?> GetStaffByBusinessAndUserIdAsync(Guid businessId, Guid userId, CancellationToken cancellationToken);
    Task<Service?> GetServiceAsync(Guid businessId, Guid serviceId, CancellationToken cancellationToken);
    Task<BusinessSettings?> GetBusinessSettingsAsync(Guid businessId, CancellationToken cancellationToken);
    Task AddAsync(BookingEntity booking, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}