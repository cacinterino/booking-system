using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Booking.Domain;

namespace Booking.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("payments");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Provider).HasConversion<int>().IsRequired();
        builder.Property(p => p.Status).HasConversion<int>().IsRequired();
        builder.Property(p => p.Amount).HasColumnType("decimal(10,2)").IsRequired();
        builder.Property(p => p.Currency).HasMaxLength(3).HasDefaultValue("PHP");
        builder.Property(p => p.ProviderReference).IsRequired().HasMaxLength(200);
        builder.Property(p => p.ProviderResponse).HasMaxLength(4000);
        builder.HasOne(p => p.Booking)
            .WithMany()
            .HasForeignKey(p => p.BookingId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(p => new { p.BookingId, p.Provider }).IsUnique();
        builder.HasIndex(p => p.ProviderReference).IsUnique();
    }
}

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");
        builder.HasKey(n => n.Id);
        builder.Property(n => n.Channel).HasConversion<int>().IsRequired();
        builder.Property(n => n.Subject).IsRequired().HasMaxLength(200);
        builder.Property(n => n.Body).IsRequired().HasMaxLength(4000);
        builder.Property(n => n.RecipientEmail).HasMaxLength(255);
        builder.Property(n => n.RecipientPhone).HasMaxLength(50);
        builder.Property(n => n.ErrorMessage).HasMaxLength(1000);
        builder.Property(n => n.RetryCount).HasDefaultValue(0);
        builder.HasOne(n => n.Business)
            .WithMany()
            .HasForeignKey(n => n.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(n => new { n.BusinessId, n.IsSent, n.CreatedAt });
    }
}

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("refresh_tokens");
        builder.HasKey(rt => rt.Id);
        builder.Property(rt => rt.Token).IsRequired().HasMaxLength(500);
        builder.Property(rt => rt.ExpiresAt).IsRequired();
        builder.Property(rt => rt.IsRevoked).HasDefaultValue(false);
        builder.Property(rt => rt.ReplacedByToken).HasMaxLength(500);
        builder.Property(rt => rt.CreatedByIp).HasMaxLength(45);
        builder.Property(rt => rt.RevokedByIp).HasMaxLength(45);
        builder.HasIndex(rt => rt.Token).IsUnique();
        builder.HasIndex(rt => new { rt.UserId, rt.IsRevoked, rt.ExpiresAt });
    }
}