using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Domain = Booking.Domain;

namespace Booking.Infrastructure.Persistence.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Domain.Customer>
{
    public void Configure(EntityTypeBuilder<Domain.Customer> builder)
    {
        builder.ToTable("customers");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(c => c.LastName).IsRequired().HasMaxLength(100);
        builder.Property(c => c.Email).IsRequired().HasMaxLength(255);
        builder.Property(c => c.Phone).HasMaxLength(50);
        builder.Property(c => c.Notes).HasMaxLength(1000);
        builder.HasOne(c => c.Business)
            .WithMany()
            .HasForeignKey(c => c.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(c => new { c.BusinessId, c.Email }).IsUnique().HasFilter("[IsDeleted] = 0");
        builder.HasIndex(c => c.UserId).IsUnique().HasFilter("[UserId] IS NOT NULL");
    }
}

public class BookingConfiguration : IEntityTypeConfiguration<Domain.Booking>
{
    public void Configure(EntityTypeBuilder<Domain.Booking> builder)
    {
        builder.ToTable("bookings");
        builder.HasKey(b => b.Id);
        builder.Property(b => b.StartTime).IsRequired();
        builder.Property(b => b.EndTime).IsRequired();
        builder.Property(b => b.Status).HasConversion<int>().IsRequired();
        builder.Property(b => b.Notes).HasMaxLength(1000);
        builder.Property(b => b.CancellationReason).HasMaxLength(500);
        builder.Property(b => b.IdempotencyKey).IsRequired().HasMaxLength(100);
        builder.Property(b => b.TotalAmount).HasColumnType("decimal(10,2)").IsRequired();
        builder.Property(b => b.DepositAmount).HasColumnType("decimal(10,2)").IsRequired();
        builder.HasOne(b => b.Business)
            .WithMany()
            .HasForeignKey(b => b.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(b => b.Service)
            .WithMany()
            .HasForeignKey(b => b.ServiceId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(b => b.Staff)
            .WithMany()
            .HasForeignKey(b => b.StaffId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(b => b.Customer)
            .WithMany()
            .HasForeignKey(b => b.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(b => new { b.BusinessId, b.StartTime });
        builder.HasIndex(b => new { b.StaffId, b.StartTime });
        builder.HasIndex(b => b.IdempotencyKey).IsUnique().HasFilter("[IsDeleted] = 0");
        builder.HasIndex(b => new { b.StaffId, b.StartTime, b.Status })
            .HasFilter("[Status] IN (1,2)");
    }
}

public class BookingServiceConfiguration : IEntityTypeConfiguration<Domain.BookingService>
{
    public void Configure(EntityTypeBuilder<Domain.BookingService> builder)
    {
        builder.ToTable("booking_services");
        builder.HasKey(bs => bs.Id);
        builder.Property(bs => bs.ServiceName).IsRequired().HasMaxLength(200);
        builder.Property(bs => bs.DurationMinutes).IsRequired();
        builder.Property(bs => bs.Price).HasColumnType("decimal(10,2)").IsRequired();
        builder.HasOne(bs => bs.Booking)
            .WithMany(b => b.Services)
            .HasForeignKey(bs => bs.BookingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}