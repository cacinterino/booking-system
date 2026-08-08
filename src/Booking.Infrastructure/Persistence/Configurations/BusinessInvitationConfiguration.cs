using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Booking.Domain;

namespace Booking.Infrastructure.Persistence.Configurations;

public class BusinessInvitationConfiguration : IEntityTypeConfiguration<BusinessInvitation>
{
    public void Configure(EntityTypeBuilder<BusinessInvitation> builder)
    {
        builder.ToTable("business_invitations");
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Email).IsRequired().HasMaxLength(255);
        builder.Property(i => i.Role).IsRequired().HasMaxLength(20);
        builder.Property(i => i.TokenHash).IsRequired().HasMaxLength(64);
        builder.Property(i => i.Status).IsRequired();
        builder.Property(i => i.ExpiresAt).IsRequired();
        builder.HasOne(i => i.Business)
            .WithMany()
            .HasForeignKey(i => i.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(i => i.Email);
    }
}