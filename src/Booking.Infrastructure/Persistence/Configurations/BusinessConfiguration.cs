using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Booking.Domain;

namespace Booking.Infrastructure.Persistence.Configurations;

public class BusinessConfiguration : IEntityTypeConfiguration<Business>
{
    public void Configure(EntityTypeBuilder<Business> builder)
    {
        builder.ToTable("businesses");
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Name).IsRequired().HasMaxLength(200);
        builder.Property(b => b.Slug).IsRequired().HasMaxLength(100);
        builder.HasIndex(b => b.Slug).IsUnique();
        builder.Property(b => b.Description).HasMaxLength(1000);
        builder.Property(b => b.Address).HasMaxLength(500);
        builder.Property(b => b.Phone).HasMaxLength(50);
        builder.Property(b => b.Email).HasMaxLength(255);
        builder.Property(b => b.Timezone).HasMaxLength(50).HasDefaultValue("Asia/Manila");
        builder.OwnsOne(b => b.Settings, sb =>
        {
            sb.ToJson();
            sb.Property(s => s.SlotIntervalMinutes).HasDefaultValue(15);
            sb.Property(s => s.AdvanceBookingDays).HasDefaultValue(30);
            sb.Property(s => s.CancellationWindowHours).HasDefaultValue(24);
            sb.Property(s => s.RequireDeposit).HasDefaultValue(true);
            sb.Property(s => s.DepositAmount).HasDefaultValue(100);
            sb.Property(s => s.Currency).HasMaxLength(3).HasDefaultValue("PHP");
        });
    }
}