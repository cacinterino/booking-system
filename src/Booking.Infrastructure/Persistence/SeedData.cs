using System.Security.Cryptography;
using Booking.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Booking.Infrastructure.Persistence;

public static class SeedData
{
    public static async Task SeedAsync(BookingDbContext db, UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager, IConfiguration config)
    {
        // Ensure roles exist
        foreach (var role in new[] { "Admin", "Staff", "Customer" })
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new ApplicationRole { Name = role, Description = role });
        }

        // Seed admin user
        var adminEmail = "admin@booked.ph";
        if (await userManager.FindByEmailAsync(adminEmail) is null)
        {
            var admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "Admin User",
                EmailConfirmed = true,
                IsActive = true,
            };
            await userManager.CreateAsync(admin, "Admin123!");
            await userManager.AddToRoleAsync(admin, "Admin");
        }

        // Seed business
        var business = db.Businesses.FirstOrDefault();
        if (business is null)
        {
            business = new Business
            {
                Name = "Manila Skin Studio",
                Slug = "manila-skin-studio",
                Description = "Premium facial and skincare services in the heart of Manila.",
                Address = "123 Paseo de Roxas, Makati City, Philippines",
                Phone = "+63 917 000 0000",
                Email = "hello@manilaskin.studio",
                Currency = "PHP",
                Timezone = "Asia/Manila",
                AdvanceBookingDays = 30,
                RequireDeposit = true,
                DepositAmount = 500,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            };
            db.Businesses.Add(business);
            await db.SaveChangesAsync();
        }

        // Link admin to business
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser is not null && adminUser.BusinessId is null)
        {
            adminUser.BusinessId = business.Id;
            await userManager.UpdateAsync(adminUser);
        }

        // Seed service categories
        var facialCategory = db.ServiceCategories.FirstOrDefault(c => c.Name == "Facials");
        if (facialCategory is null)
        {
            facialCategory = new ServiceCategory
            {
                Name = "Facials",
                Description = "Facial treatments and skincare",
                IsActive = true,
            };
            db.ServiceCategories.Add(facialCategory);
            await db.SaveChangesAsync();
        }

        var massageCategory = db.ServiceCategories.FirstOrDefault(c => c.Name == "Massage");
        if (massageCategory is null)
        {
            massageCategory = new ServiceCategory
            {
                Name = "Massage",
                Description = "Therapeutic massage services",
                IsActive = true,
            };
            db.ServiceCategories.Add(massageCategory);
            await db.SaveChangesAsync();
        }

        // Seed services
        if (!db.Services.Any())
        {
            var services = new[]
            {
                new Service
                {
                    BusinessId = business.Id,
                    CategoryId = facialCategory.Id,
                    Name = "Classic Facial",
                    Description = "Deep cleansing facial with exfoliation and hydration.",
                    Price = 1500,
                    DurationMinutes = 45,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                },
                new Service
                {
                    BusinessId = business.Id,
                    CategoryId = facialCategory.Id,
                    Name = "HydraFacial",
                    Description = "Medical-grade hydradermabrasion for instant glow.",
                    Price = 3500,
                    DurationMinutes = 60,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                },
                new Service
                {
                    BusinessId = business.Id,
                    CategoryId = massageCategory.Id,
                    Name = "Swedish Massage",
                    Description = "Relaxing full-body massage with aromatic oils.",
                    Price = 2000,
                    DurationMinutes = 60,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                },
            };
            db.Services.AddRange(services);
            await db.SaveChangesAsync();
        }

        // Seed staff
        if (!db.Staff.Any())
        {
            var staff1 = new Staff
            {
                BusinessId = business.Id,
                FullName = "Dr. Reyes",
                Email = "reyes@manilaskin.studio",
                Phone = "+63 917 111 1111",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            };
            db.Staff.Add(staff1);

            var staff2 = new Staff
            {
                BusinessId = business.Id,
                FullName = "Ana Santos",
                Email = "ana@manilaskin.studio",
                Phone = "+63 917 222 2222",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            };
            db.Staff.Add(staff2);
            await db.SaveChangesAsync();

            // Link staff to services
            var classicFacial = db.Services.First(s => s.Name == "Classic Facial");
            var hydraFacial = db.Services.First(s => s.Name == "HydraFacial");
            var swedishMassage = db.Services.First(s => s.Name == "Swedish Massage");

            db.StaffServices.AddRange(new[]
            {
                new StaffService { StaffId = staff1.Id, ServiceId = classicFacial.Id },
                new StaffService { StaffId = staff1.Id, ServiceId = hydraFacial.Id },
                new StaffService { StaffId = staff2.Id, ServiceId = classicFacial.Id },
                new StaffService { StaffId = staff2.Id, ServiceId = swedishMassage.Id },
            });

            // Seed weekly schedules (Mon-Fri 9am-6pm)
            foreach (var staff in new[] { staff1, staff2 })
            {
                for (int day = 1; day <= 5; day++) // Monday to Friday
                {
                    db.StaffSchedules.Add(new StaffSchedule
                    {
                        StaffId = staff.Id,
                        DayOfWeek = day,
                        StartTime = new TimeSpan(9, 0, 0),
                        EndTime = new TimeSpan(18, 0, 0),
                        IsActive = true,
                    });
                }
            }

            await db.SaveChangesAsync();
        }

        // Seed demo bookings
        if (!db.Bookings.Any())
        {
            var manilaTz = TimeZoneInfo.FindSystemTimeZoneById("Asia/Manila");
            var tomorrow = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, manilaTz).AddDays(1).Date;

            var staff1 = db.Staff.First(s => s.FullName == "Dr. Reyes");
            var classicFacial = db.Services.First(s => s.Name == "Classic Facial");

            var booking1 = new Booking
            {
                BusinessId = business.Id,
                ServiceId = classicFacial.Id,
                StaffId = staff1.Id,
                CustomerName = "Maria Santos",
                CustomerEmail = "maria@example.com",
                CustomerPhone = "+63 917 333 3333",
                StartTime = TimeZoneInfo.ConvertTimeToUtc(new DateTime(tomorrow.Year, tomorrow.Month, tomorrow.Day, 10, 0, 0), manilaTz),
                EndTime = TimeZoneInfo.ConvertTimeToUtc(new DateTime(tomorrow.Year, tomorrow.Month, tomorrow.Day, 10, 45, 0), manilaTz),
                Status = BookingStatus.Confirmed,
                TotalAmount = 1500,
                AccessCode = GenerateAccessCode(),
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false,
            };
            db.Bookings.Add(booking1);

            var staff2 = db.Staff.First(s => s.FullName == "Ana Santos");
            var swedishMassage = db.Services.First(s => s.Name == "Swedish Massage");

            var booking2 = new Booking
            {
                BusinessId = business.Id,
                ServiceId = swedishMassage.Id,
                StaffId = staff2.Id,
                CustomerName = "Juan Dela Cruz",
                CustomerEmail = "juan@example.com",
                CustomerPhone = "+63 917 444 4444",
                StartTime = TimeZoneInfo.ConvertTimeToUtc(new DateTime(tomorrow.Year, tomorrow.Month, tomorrow.Day, 14, 0, 0), manilaTz),
                EndTime = TimeZoneInfo.ConvertTimeToUtc(new DateTime(tomorrow.Year, tomorrow.Month, tomorrow.Day, 15, 0, 0), manilaTz),
                Status = BookingStatus.Pending,
                TotalAmount = 2000,
                AccessCode = GenerateAccessCode(),
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false,
            };
            db.Bookings.Add(booking2);

            await db.SaveChangesAsync();
        }
    }

    private static string GenerateAccessCode()
    {
        var bytes = RandomNumberGenerator.GetBytes(4);
        return BitConverter.ToString(bytes).Replace("-", "").Substring(0, 8);
    }
}
