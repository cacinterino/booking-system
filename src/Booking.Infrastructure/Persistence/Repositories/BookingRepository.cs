using System;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Booking.Application.Bookings.Exceptions;
using Booking.Application.Bookings.Interfaces;
using Booking.Domain;
using Booking.Infrastructure.Persistence;
using BookingEntity = Booking.Domain.Booking;
using StaffEntity = Booking.Domain.Staff;

namespace Booking.Infrastructure.Persistence.Repositories;

public class BookingRepository : IBookingRepository
{
    private readonly BookingDbContext _context;

    public BookingRepository(BookingDbContext context)
    {
        _context = context;
    }

    public async Task<BookingEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Bookings
            .Include(b => b.Service)
            .Include(b => b.Staff)
            .Include(b => b.Customer)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task<BookingEntity?> GetByIdempotencyKeyAsync(Guid businessId, string idempotencyKey, CancellationToken cancellationToken)
    {
        return await _context.Bookings
            .Include(b => b.Service)
            .Include(b => b.Staff)
            .Include(b => b.Customer)
            .FirstOrDefaultAsync(b => b.BusinessId == businessId && b.IdempotencyKey == idempotencyKey, cancellationToken);
    }

    public async Task<IReadOnlyList<BookingEntity>> GetByCustomerAsync(Guid customerId, bool upcomingOnly, CancellationToken cancellationToken)
    {
        var query = _context.Bookings
            .Include(b => b.Service)
            .Include(b => b.Staff)
            .Where(b => b.CustomerId == customerId && b.Status != BookingStatus.Cancelled);

        if (upcomingOnly)
            query = query.Where(b => b.StartTime > DateTime.UtcNow);

        return await query.OrderBy(b => b.StartTime).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BookingEntity>> GetByBusinessAsync(
        Guid businessId,
        BookingStatus? status,
        Guid? staffId,
        DateTime? fromDate,
        DateTime? toDate,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _context.Bookings
            .Include(b => b.Service)
            .Include(b => b.Staff)
            .Include(b => b.Customer)
            .Where(b => b.BusinessId == businessId);

        if (status.HasValue)
            query = query.Where(b => b.Status == status.Value);
        if (staffId.HasValue)
            query = query.Where(b => b.StaffId == staffId.Value);
        if (fromDate.HasValue)
            query = query.Where(b => b.StartTime >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(b => b.StartTime < toDate.Value);

        return await query
            .OrderBy(b => b.StartTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountByBusinessAsync(
        Guid businessId,
        BookingStatus? status,
        Guid? staffId,
        DateTime? fromDate,
        DateTime? toDate,
        CancellationToken cancellationToken)
    {
        var query = _context.Bookings.Where(b => b.BusinessId == businessId);

        if (status.HasValue)
            query = query.Where(b => b.Status == status.Value);
        if (staffId.HasValue)
            query = query.Where(b => b.StaffId == staffId.Value);
        if (fromDate.HasValue)
            query = query.Where(b => b.StartTime >= fromDate.Value);
        if (toDate.HasValue)
            query = query.Where(b => b.StartTime < toDate.Value);

        return await query.CountAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<BookingEntity>> GetCalendarAsync(
        Guid businessId,
        Guid? staffId,
        DateTime fromUtc,
        DateTime toUtc,
        CancellationToken cancellationToken)
    {
        var query = _context.Bookings
            .Include(b => b.Service)
            .Include(b => b.Staff)
            .Include(b => b.Customer)
            .Where(b => b.BusinessId == businessId
                && b.StartTime < toUtc
                && b.EndTime > fromUtc
                && b.Status != BookingStatus.Cancelled);

        if (staffId.HasValue)
            query = query.Where(b => b.StaffId == staffId.Value);

        return await query.OrderBy(b => b.StartTime).ToListAsync(cancellationToken);
    }

    public async Task<Customer?> GetCustomerByEmailAsync(Guid businessId, string email, CancellationToken cancellationToken)
    {
        return await _context.Customers
            .FirstOrDefaultAsync(c => c.BusinessId == businessId && c.Email == email, cancellationToken);
    }

    public async Task<Customer?> GetCustomerByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Customers
            .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);
    }

    public async Task<Guid> CreateCustomerAsync(Customer customer, CancellationToken cancellationToken)
    {
        _context.Customers.Add(customer);
        await _context.SaveChangesAsync(cancellationToken);
        return customer.Id;
    }

    public async Task<StaffEntity?> GetStaffByBusinessAndUserIdAsync(Guid businessId, Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Staff
            .FirstOrDefaultAsync(s => s.BusinessId == businessId && s.UserId == userId, cancellationToken);
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

    public async Task AddAsync(BookingEntity booking, CancellationToken cancellationToken)
    {
        await _context.Bookings.AddAsync(booking, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException pg && pg.SqlState == "23P01")
        {
            throw new BookingConflictException("The chosen slot is no longer available");
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException pg && pg.SqlState == "23505")
        {
            throw new IdempotencyConflictException("A booking with this idempotency key already exists");
        }
    }
}