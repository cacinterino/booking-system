using Booking.Domain;
using BookingEntity = Booking.Domain.Booking;
using StaffEntity = Booking.Domain.Staff;

namespace Booking.Application.Availability.Interfaces;

public interface IAvailabilityRepository
{
    Task<Service?> GetServiceAsync(Guid businessId, Guid serviceId, CancellationToken cancellationToken);
    Task<BusinessSettings?> GetBusinessSettingsAsync(Guid businessId, CancellationToken cancellationToken);
    Task<IReadOnlyList<StaffEntity>> GetStaffForServiceAsync(Guid businessId, Guid serviceId, CancellationToken cancellationToken);
    Task<IReadOnlyList<StaffSchedule>> GetSchedulesForStaffAsync(Guid staffId, CancellationToken cancellationToken);
    Task<IReadOnlyList<ScheduleOverride>> GetOverridesForStaffAsync(Guid staffId, CancellationToken cancellationToken);
    Task<IReadOnlyList<BookingEntity>> GetBookingsAsync(Guid staffId, DateTime fromUtc, DateTime toUtc, CancellationToken cancellationToken);
}