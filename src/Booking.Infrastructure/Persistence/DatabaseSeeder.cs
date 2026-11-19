using Booking.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using BookingEntity = Booking.Domain.Booking;

namespace Booking.Infrastructure.Persistence;

/// <summary>
/// Idempotent database setup. <see cref="SeedRolesAsync"/> always runs so the
/// Identity roles referenced by auth handlers exist. <see cref="SeedDemoAsync"/>
/// only runs when explicitly requested (--seed or Seed__Demo=true) and creates
/// fake demo data with @example.com addresses.
/// </summary>
public static class DatabaseSeeder
{
    public const string DemoSlug = "booked-demo";
    public const string DemoAdminEmail = "demo@booked.local";
    public const string DemoAdminPassword = "Demo123!";

    private static readonly string[] Roles = ["Admin", "Staff", "Customer"];

    public static async Task SeedRolesAsync(RoleManager<ApplicationRole> roleManager)
    {
        foreach (var role in Roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new ApplicationRole { Name = role, Description = role });
        }
    }

    public static async Task SeedDemoAsync(
        BookingDbContext db,
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        await SeedRolesAsync(roleManager);

        if (await db.Businesses.AnyAsync(b => b.Slug == DemoSlug, cancellationToken))
        {
            logger.LogInformation("Demo data already present for slug {Slug}; nothing to seed.", DemoSlug);
            return;
        }

        var business = new Business(
            "Booked Demo Studio",
            DemoSlug,
            "Fake demo business seeded for local testing. No real customers.",
            "12 Sample Street, Makati City",
            "+63 900 000 0000",
            "hello@example.com");

        business.UpdateSettings(new BusinessSettings
        {
            SlotIntervalMinutes = 15,
            AdvanceBookingDays = 60,
            CancellationWindowHours = 24,
            RequireDeposit = false,
            Currency = "PHP"
        });

        db.Businesses.Add(business);
        await db.SaveChangesAsync(cancellationToken);

        var admin = new ApplicationUser
        {
            UserName = DemoAdminEmail,
            Email = DemoAdminEmail,
            FullName = "Demo Owner",
            EmailConfirmed = true,
            IsActive = true,
            BusinessId = business.Id
        };

        var createResult = await userManager.CreateAsync(admin, DemoAdminPassword);
        if (!createResult.Succeeded)
        {
            var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Could not create the demo admin user: {errors}");
        }

        await userManager.AddToRoleAsync(admin, "Admin");

        var owner = new Staff(business.Id, "Demo", "Owner", DemoAdminEmail, "+63 900 000 0001", admin.Id);
        var therapist = new Staff(business.Id, "Ana", "Santos", "ana.santos@example.com", "+63 900 000 0002");

        var facial = new Service(business.Id, "Signature Facial", 45, 1200m,
            description: "Cleanse, exfoliate, and hydrate. Demo service.", displayOrder: 1);
        var massage = new Service(business.Id, "Deep Tissue Massage", 60, 1800m,
            description: "Focused pressure for tight muscles. Demo service.", displayOrder: 2);
        var manicure = new Service(business.Id, "Gel Manicure", 45, 800m,
            description: "Shape, buff, and gel polish. Demo service.", displayOrder: 3);

        db.Services.AddRange(facial, massage, manicure);
        await db.SaveChangesAsync(cancellationToken);

        owner.AddService(facial.Id);
        owner.AddService(manicure.Id);
        therapist.AddService(facial.Id);
        therapist.AddService(massage.Id);
        therapist.AddService(manicure.Id);

        db.Staff.AddRange(owner, therapist);
        await db.SaveChangesAsync(cancellationToken);

        // Monday to Saturday, 9:00am to 6:00pm local (Asia/Manila).
        var schedules = new List<StaffSchedule>();
        foreach (var member in new[] { owner, therapist })
        {
            for (var day = DayOfWeek.Monday; day <= DayOfWeek.Saturday; day++)
            {
                schedules.Add(new StaffSchedule(member.Id, day, TimeSpan.FromHours(9), TimeSpan.FromHours(18)));
            }
        }

        db.StaffSchedules.AddRange(schedules);

        var maria = new Customer(business.Id, "Maria", "Cruz", "maria.cruz@example.com", "+63 900 000 0003");
        var paolo = new Customer(business.Id, "Paolo", "Reyes", "paolo.reyes@example.com", "+63 900 000 0004");
        var liza = new Customer(business.Id, "Liza", "Fernandez", "liza.fernandez@example.com", "+63 900 000 0005");
        db.Customers.AddRange(maria, paolo, liza);
        await db.SaveChangesAsync(cancellationToken);

        var firstDay = NextWorkingDate(DateOnly.FromDateTime(DateTime.UtcNow.AddHours(8)), 1);
        var secondDay = NextWorkingDate(firstDay, 1);

        var bookingOne = CreateDemoBooking(business, facial, therapist, maria, firstDay, 10, 0, "seed-demo-1", "DEMO-1001");
        bookingOne.Confirm();

        var bookingTwo = CreateDemoBooking(business, massage, therapist, paolo, firstDay, 14, 0, "seed-demo-2", "DEMO-1002");

        var bookingThree = CreateDemoBooking(business, manicure, owner, liza, secondDay, 11, 0, "seed-demo-3", "DEMO-1003");
        bookingThree.Confirm();

        db.Bookings.AddRange(bookingOne, bookingTwo, bookingThree);
        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Seeded demo business /book/{Slug} with {StaffCount} staff, {ServiceCount} services and {BookingCount} bookings.",
            DemoSlug, 2, 3, 3);
    }

    private static BookingEntity CreateDemoBooking(
        Business business,
        Service service,
        Staff staff,
        Customer customer,
        DateOnly date,
        int hour,
        int minute,
        string idempotencyKey,
        string accessCode)
    {
        var startUtc = ManilaToUtc(date, hour, minute);
        var endUtc = startUtc.AddMinutes(service.DurationMinutes);

        var booking = new BookingEntity(
            business.Id,
            service.Id,
            staff.Id,
            customer.Id,
            startUtc,
            endUtc,
            service.Price,
            0m,
            idempotencyKey,
            "Seeded demo booking");

        booking.AddService(new BookingService(booking.Id, service.Id, service.Name, service.DurationMinutes, service.Price));
        booking.SetAccessCode(accessCode);

        return booking;
    }

    private static DateOnly NextWorkingDate(DateOnly from, int daysAhead)
    {
        var date = from.AddDays(daysAhead);
        while (date.DayOfWeek == DayOfWeek.Sunday)
            date = date.AddDays(1);
        return date;
    }

    private static DateTime ManilaToUtc(DateOnly date, int hour, int minute)
    {
        var local = date.ToDateTime(new TimeOnly(hour, minute));
        return DateTime.SpecifyKind(local.AddHours(-8), DateTimeKind.Utc);
    }
}
