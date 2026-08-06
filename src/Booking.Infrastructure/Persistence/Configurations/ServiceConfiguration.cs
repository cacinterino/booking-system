using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Booking.Domain;

namespace Booking.Infrastructure.Persistence.Configurations;

public class ServiceCategoryConfiguration : IEntityTypeConfiguration<ServiceCategory>
{
    public void Configure(EntityTypeBuilder<ServiceCategory> builder)
    {
        builder.ToTable("service_categories");
        builder.HasKey(sc => sc.Id);
        builder.Property(sc => sc.Name).IsRequired().HasMaxLength(100);
        builder.Property(sc => sc.Description).HasMaxLength(500);
        builder.Property(sc => sc.DisplayOrder).HasDefaultValue(0);
        builder.HasOne(sc => sc.Business)
            .WithMany()
            .HasForeignKey(sc => sc.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(sc => new { sc.BusinessId, sc.Name });
    }
}

public class ServiceConfiguration : IEntityTypeConfiguration<Service>
{
    public void Configure(EntityTypeBuilder<Service> builder)
    {
        builder.ToTable("services");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Name).IsRequired().HasMaxLength(200);
        builder.Property(s => s.Description).HasMaxLength(1000);
        builder.Property(s => s.DurationMinutes).IsRequired();
        builder.Property(s => s.Price).HasColumnType("decimal(10,2)").IsRequired();
        builder.Property(s => s.IsActive).HasDefaultValue(true);
        builder.Property(s => s.DisplayOrder).HasDefaultValue(0);
        builder.Property(s => s.Color).HasMaxLength(7);
        builder.HasOne(s => s.Business)
            .WithMany()
            .HasForeignKey(s => s.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(s => s.Category)
            .WithMany()
            .HasForeignKey(s => s.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);
        builder.HasIndex(s => new { s.BusinessId, s.IsActive });
    }
}