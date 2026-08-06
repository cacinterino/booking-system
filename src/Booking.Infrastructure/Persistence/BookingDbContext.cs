using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Domain = Booking.Domain;

namespace Booking.Infrastructure.Persistence;

public class BookingDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public BookingDbContext(DbContextOptions<BookingDbContext> options) : base(options) { }

    public DbSet<Domain.Business> Businesses => Set<Domain.Business>();
    public DbSet<Domain.ServiceCategory> ServiceCategories => Set<Domain.ServiceCategory>();
    public DbSet<Domain.Service> Services => Set<Domain.Service>();
    public DbSet<Domain.Staff> Staff => Set<Domain.Staff>();
    public DbSet<Domain.StaffService> StaffServices => Set<Domain.StaffService>();
    public DbSet<Domain.StaffSchedule> StaffSchedules => Set<Domain.StaffSchedule>();
    public DbSet<Domain.ScheduleOverride> ScheduleOverrides => Set<Domain.ScheduleOverride>();
    public DbSet<Domain.Customer> Customers => Set<Domain.Customer>();
    public DbSet<Domain.Booking> Bookings => Set<Domain.Booking>();
    public DbSet<Domain.BookingService> BookingServices => Set<Domain.BookingService>();
    public DbSet<Domain.Payment> Payments => Set<Domain.Payment>();
    public DbSet<Domain.Notification> Notifications => Set<Domain.Notification>();
    public DbSet<Domain.RefreshToken> RefreshTokens => Set<Domain.RefreshToken>();
    public DbSet<Domain.BusinessInvitation> BusinessInvitations => Set<Domain.BusinessInvitation>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(BookingDbContext).Assembly);

        builder.Entity<Domain.Booking>().HasQueryFilter(b => !b.IsDeleted);
        builder.Entity<Domain.Customer>().HasQueryFilter(c => !c.IsDeleted);
    }
}

public class ApplicationUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;
    public Guid? BusinessId { get; set; }
    public new string? PhoneNumber { get; set; }
    public bool IsActive { get; set; } = true;
}

public class ApplicationRole : IdentityRole<Guid>
{
    public string Description { get; set; } = string.Empty;
}