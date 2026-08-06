using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Booking.Domain;

namespace Booking.Infrastructure.Persistence.Configurations;

public class StaffConfiguration : IEntityTypeConfiguration<Staff>
{
    public void Configure(EntityTypeBuilder<Staff> builder)
    {
        builder.ToTable("staff");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(s => s.LastName).IsRequired().HasMaxLength(100);
        builder.Property(s => s.Email).HasMaxLength(255);
        builder.Property(s => s.Phone).HasMaxLength(50);
        builder.Property(s => s.AvatarUrl).HasMaxLength(500);
        builder.Property(s => s.IsActive).HasDefaultValue(true);
        builder.Property(s => s.DisplayOrder).HasDefaultValue(0);
        builder.HasOne(s => s.Business)
            .WithMany()
            .HasForeignKey(s => s.BusinessId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(s => new { s.BusinessId, s.IsActive });
        builder.HasIndex(s => s.UserId).IsUnique().HasFilter("\"UserId\" IS NOT NULL");
    }
}

public class StaffServiceConfiguration : IEntityTypeConfiguration<StaffService>
{
    public void Configure(EntityTypeBuilder<StaffService> builder)
    {
        builder.ToTable("staff_services");
        builder.HasKey(ss => ss.Id);
        builder.HasOne(ss => ss.Staff)
            .WithMany(s => s.Services)
            .HasForeignKey(ss => ss.StaffId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(ss => new { ss.StaffId, ss.ServiceId }).IsUnique();
    }
}

public class StaffScheduleConfiguration : IEntityTypeConfiguration<StaffSchedule>
{
    public void Configure(EntityTypeBuilder<StaffSchedule> builder)
    {
        builder.ToTable("staff_schedules");
        builder.HasKey(ss => ss.Id);
        builder.Property(ss => ss.DayOfWeek).IsRequired();
        builder.Property(ss => ss.StartTime).IsRequired();
        builder.Property(ss => ss.EndTime).IsRequired();
        builder.Property(ss => ss.IsWorking).HasDefaultValue(true);
        builder.HasOne(ss => ss.Staff)
            .WithMany()
            .HasForeignKey(ss => ss.StaffId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(ss => new { ss.StaffId, ss.DayOfWeek }).IsUnique();
    }
}

public class ScheduleOverrideConfiguration : IEntityTypeConfiguration<ScheduleOverride>
{
    public void Configure(EntityTypeBuilder<ScheduleOverride> builder)
    {
        builder.ToTable("schedule_overrides");
        builder.HasKey(so => so.Id);
        builder.Property(so => so.Date).IsRequired();
        builder.Property(so => so.StartTime).IsRequired(false);
        builder.Property(so => so.EndTime).IsRequired(false);
        builder.Property(so => so.IsTimeOff).HasDefaultValue(false);
        builder.Property(so => so.Reason).HasMaxLength(500);
        builder.HasOne(so => so.Staff)
            .WithMany()
            .HasForeignKey(so => so.StaffId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(so => new { so.StaffId, so.Date }).IsUnique();
    }
}