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

        var owner = new Staff(business.Id, "Demo", "Owner", DemoAdminEmail, "+63 917 555 0100", admin.Id);
        var therapist = new Staff(business.Id, "Ana", "Santos", "ana.santos@booked.local", "+63 918 555 0102");

        var facial = new Service(business.Id, "Signature Facial", 45, 1200m,
            description: "Deep cleanse, exfoliation, gentle extraction, and hydration mask.", displayOrder: 1);
        var massage = new Service(business.Id, "Deep Tissue Massage", 60, 1800m,
            description: "Therapeutic firm pressure focused on relieving chronic muscle tension.", displayOrder: 2);
        var manicure = new Service(business.Id, "Gel Manicure", 45, 800m,
            description: "Cuticle care, nail shaping, hand massage, and long-lasting gel polish.", displayOrder: 3);

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

        var cCamille = new Customer(business.Id, "Camille", "Soriano", "camille.soriano@gmail.com", "+63 917 842 1904");
        var cJoshua = new Customer(business.Id, "Joshua Gabriel", "Mendoza", "josh.mendoza@yahoo.com", "+63 928 514 8392");
        var cBea = new Customer(business.Id, "Bea Andrea", "Valenzuela", "bea.valenzuela@outlook.com", "+63 918 903 4421");
        var cMark = new Customer(business.Id, "Mark Christian", "Dizon", "mcdizon@gmail.com", "+63 917 332 7854");
        var cPat = new Customer(business.Id, "Patricia Mae", "Ramos", "patricia.ramos@icloud.com", "+63 908 721 6639");
        var cRafael = new Customer(business.Id, "Rafael Antonio", "Aquino", "rafael.aquino@gmail.com", "+63 917 659 0214");
        var cKlarisse = new Customer(business.Id, "Klarisse Nicole", "Tan", "klarisse.tan@gmail.com", "+63 920 488 1932");
        var cMaria = new Customer(business.Id, "Maria", "Cruz", "maria.cruz@gmail.com", "+63 917 800 2311");
        var cPaolo = new Customer(business.Id, "Paolo", "Reyes", "paolo.reyes@yahoo.com", "+63 928 650 9482");
        var cAngelo = new Customer(business.Id, "Angelo David", "Reyes", "adreyes@gmail.com", "+63 917 220 5418");
        var cLiza = new Customer(business.Id, "Liza", "Fernandez", "liza.fernandez@gmail.com", "+63 908 411 7230");
        var cBianca = new Customer(business.Id, "Bianca Marie", "Santos", "bianca.santos@gmail.com", "+63 917 554 9912");
        var cDave = new Customer(business.Id, "Dave Austin", "Villanueva", "dave.villanueva@gmail.com", "+63 928 331 4055");

        db.Customers.AddRange(cCamille, cJoshua, cBea, cMark, cPat, cRafael, cKlarisse, cMaria, cPaolo, cAngelo, cLiza, cBianca, cDave);
        await db.SaveChangesAsync(cancellationToken);

        var todayManila = DateOnly.FromDateTime(DateTime.UtcNow.AddHours(8));
        var tuesday = todayManila.AddDays(-((int)todayManila.DayOfWeek - (int)DayOfWeek.Tuesday));
        var wednesday = tuesday.AddDays(1);
        var thursday = tuesday.AddDays(2);
        var friday = tuesday.AddDays(3);
        var saturday = tuesday.AddDays(4);

        var bookings = new List<BookingEntity>();

        // Tuesday (Past - Completed)
        var b1 = CreateDemoBooking(business, facial, therapist, cCamille, tuesday, 10, 0, "seed-tue-1", "7K9P-M2X4");
        b1.Confirm();
        b1.Complete();
        var b2 = CreateDemoBooking(business, massage, therapist, cJoshua, tuesday, 14, 0, "seed-tue-2", "4R8W-T6Y1");
        b2.Confirm();
        b2.Complete();
        bookings.AddRange([b1, b2]);

        // Wednesday (Past - Completed & Cancelled)
        var b3 = CreateDemoBooking(business, manicure, owner, cBea, wednesday, 11, 0, "seed-wed-1", "9B3D-H5L8");
        b3.Confirm();
        b3.Complete();
        var b4 = CreateDemoBooking(business, massage, therapist, cMark, wednesday, 15, 30, "seed-wed-2", "3M7C-N9K2");
        b4.Cancel("Urgent work meeting conflict");
        bookings.AddRange([b3, b4]);

        // Thursday (Today - Completed)
        var b5 = CreateDemoBooking(business, facial, therapist, cPat, thursday, 10, 0, "seed-thu-1", "6V4L-P8X3");
        b5.Confirm();
        b5.Complete();
        var b6 = CreateDemoBooking(business, massage, therapist, cRafael, thursday, 14, 30, "seed-thu-2", "2D9J-W7T5");
        b6.Confirm();
        b6.Complete();
        var b7 = CreateDemoBooking(business, manicure, owner, cKlarisse, thursday, 16, 0, "seed-thu-3", "8N5Q-F3B6");
        b7.Confirm();
        b7.Complete();
        bookings.AddRange([b5, b6, b7]);

        // Friday (Tomorrow - Active for demo)
        var b8 = CreateDemoBooking(business, facial, therapist, cMaria, friday, 10, 0, "seed-fri-1", "8F3K-2Q7X");
        b8.Confirm();
        var b9 = CreateDemoBooking(business, facial, owner, cAngelo, friday, 11, 30, "seed-fri-2", "9T4E-K7W2");
        b9.Confirm();
        var b10 = CreateDemoBooking(business, massage, therapist, cPaolo, friday, 14, 0, "seed-fri-3", "5P2X-L9T4"); // Pending
        bookings.AddRange([b8, b9, b10]);

        // Saturday (Weekend)
        var b11 = CreateDemoBooking(business, manicure, owner, cLiza, saturday, 11, 0, "seed-sat-1", "3W8K-P5M9");
        b11.Confirm();
        var b12 = CreateDemoBooking(business, facial, therapist, cBianca, saturday, 13, 30, "seed-sat-2", "7Y3M-H8R6");
        b12.Confirm();
        var b13 = CreateDemoBooking(business, massage, therapist, cDave, saturday, 15, 0, "seed-sat-3", "4L9V-C2K8"); // Pending
        bookings.AddRange([b11, b12, b13]);

        db.Bookings.AddRange(bookings);

        // Schedule override for Ana on Saturday (early custom hours)
        db.ScheduleOverrides.Add(new ScheduleOverride(
            therapist.Id,
            saturday,
            TimeSpan.FromHours(9),
            TimeSpan.FromHours(16).Add(TimeSpan.FromMinutes(30)),
            "Staff Continuing Education Workshop"));

        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Seeded demo business /book/{Slug} with {StaffCount} staff, {ServiceCount} services and {BookingCount} realistic bookings.",
            DemoSlug, 2, 3, bookings.Count);
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
