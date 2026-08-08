using Microsoft.EntityFrameworkCore;
using Booking.Application.Business.Interfaces;
using Booking.Domain;
using Booking.Infrastructure.Persistence;
using StaffEntity = Booking.Domain.Staff;

namespace Booking.Infrastructure.Persistence.Repositories;

public class BusinessRepository : IBusinessRepository
{
    private readonly BookingDbContext _context;

    public BusinessRepository(BookingDbContext context)
    {
        _context = context;
    }

    public async Task<Booking.Domain.Business?> GetByIdAsync(Guid businessId, CancellationToken cancellationToken)
    {
        return await _context.Businesses.FirstOrDefaultAsync(b => b.Id == businessId, cancellationToken);
    }

    public async Task<Booking.Domain.Business?> GetBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        return await _context.Businesses.FirstOrDefaultAsync(b => b.Slug == slug.ToLowerInvariant(), cancellationToken);
    }

    public async Task<bool> SlugExistsAsync(string slug, CancellationToken cancellationToken)
    {
        return await _context.Businesses.AnyAsync(b => b.Slug == slug.ToLowerInvariant(), cancellationToken);
    }

    public async Task AddBusinessAsync(Booking.Domain.Business business, CancellationToken cancellationToken)
    {
        await _context.Businesses.AddAsync(business, cancellationToken);
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

    public async Task<BusinessInvitation?> GetInvitationByTokenAsync(string rawToken, CancellationToken cancellationToken)
    {
        var hash = BusinessInvitation.HashToken(rawToken);
        return await _context.BusinessInvitations
            .Include(i => i.Business)
            .FirstOrDefaultAsync(i => i.TokenHash == hash, cancellationToken);
    }

    public async Task<BusinessInvitation?> GetInvitationByIdAsync(Guid invitationId, CancellationToken cancellationToken)
    {
        return await _context.BusinessInvitations
            .Include(i => i.Business)
            .FirstOrDefaultAsync(i => i.Id == invitationId, cancellationToken);
    }

    public async Task<StaffEntity?> GetStaffByUserIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Staff
            .Include(s => s.Schedules)
            .Include(s => s.Overrides)
            .Include(s => s.Services)
            .FirstOrDefaultAsync(s => s.UserId == userId, cancellationToken);
    }

    public async Task<StaffEntity?> GetStaffByUserIdAndBusinessAsync(Guid userId, Guid businessId, CancellationToken cancellationToken)
    {
        return await _context.Staff
            .FirstOrDefaultAsync(s => s.UserId == userId && s.BusinessId == businessId, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}