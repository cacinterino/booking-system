using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Booking.Domain;
using Booking.Infrastructure.Persistence;
using BookingEntity = Booking.Domain.Booking;

namespace Booking.IntegrationTests;

[Collection("BookingApi")]
public class BookingStaffTests
{
    private readonly BookingApiFixture _fixture;

    public BookingStaffTests(BookingApiFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task CalendarAndStatusTransitions_RoundTrip()
    {
        var (businessId, serviceId, staffId, userId, bookingId, startUtc) = await SeedAsync("staff-barbershop-a");
        var client = _fixture.Factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", MintToken(userId, businessId));
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        // 1. Staff calendar shows the pending booking on the seeded day (Manila times).
        var localDate = new DateOnly(2026, 8, 15);
        var calendarResponse = await client.GetAsync($"/api/bookings/calendar?from={localDate:yyyy-MM-dd}&to={localDate:yyyy-MM-dd}");
        calendarResponse.StatusCode.Should().Be(HttpStatusCode.OK,
            $"calendar failed with body: {await calendarResponse.Content.ReadAsStringAsync()}");
        var calendar = await ReadAsync<List<CalendarEventDto>>(calendarResponse);
        calendar.Should().ContainSingle(e => e.Id == bookingId);
        var evt = calendar.Single(e => e.Id == bookingId);
        evt.Start.Should().Be("2026-08-15T10:00:00");
        evt.End.Should().Be("2026-08-15T11:00:00");

        // 2. Staff confirms: Pending -> Confirmed.
        var confirmResponse = await client.PutAsync($"/api/bookings/{bookingId}/status",
            new StringContent(JsonSerializer.Serialize(new { status = (int)BookingStatus.Confirmed }), Encoding.UTF8, "application/json"));
        confirmResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // 3. Staff completes: Confirmed -> Completed.
        var completeResponse = await client.PutAsync($"/api/bookings/{bookingId}/status",
            new StringContent(JsonSerializer.Serialize(new { status = (int)BookingStatus.Completed }), Encoding.UTF8, "application/json"));
        completeResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // 4. Status is now Completed in the DB.
        var booking = await GetBookingAsync(bookingId);
        booking.Status.Should().Be(BookingStatus.Completed);
    }

    [Fact]
    public async Task PendingToCompleted_Returns409()
    {
        var (businessId, serviceId, staffId, userId, bookingId, startUtc) = await SeedAsync("staff-barbershop-b");
        var client = _fixture.Factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", MintToken(userId, businessId));
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        // Booking is still Pending; jumping straight to Completed is an invalid transition.
        var response = await client.PutAsync($"/api/bookings/{bookingId}/status",
            new StringContent(JsonSerializer.Serialize(new { status = (int)BookingStatus.Completed }), Encoding.UTF8, "application/json"));

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    private async Task<(Guid BusinessId, Guid ServiceId, Guid StaffId, Guid UserId, Guid BookingId, DateTime StartUtc)> SeedAsync(string slug)
    {
        using var scope = _fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BookingDbContext>();

        var business = new Business("Staff Barbershop", slug);
        var service = new Service(business.Id, "Staff Cut", 60, 500m);
        var userId = Guid.NewGuid();
        var staff = new Staff(business.Id, "Stella", "Staff", $"stella.{slug}.staff@example.com", userId: userId);
        staff.AddService(service.Id);

        // Saturday 2026-08-15 at 10:00 Manila == 02:00 UTC.
        var localDate = new DateOnly(2026, 8, 15);
        var schedule = new StaffSchedule(staff.Id, localDate.DayOfWeek, new TimeSpan(9, 0, 0), new TimeSpan(17, 0, 0));
        var startUtc = new DateTime(localDate.Year, localDate.Month, localDate.Day, 2, 0, 0, DateTimeKind.Utc);

        var customer = new Customer(business.Id, "Sara", "Customer", "sara@example.com");

        var booking = new BookingEntity(business.Id, service.Id, staff.Id, customer.Id, startUtc, startUtc.AddHours(1), 500, 0, $"staff-key-{slug}");

        db.Businesses.Add(business);
        db.Services.Add(service);
        db.Staff.Add(staff);
        db.StaffSchedules.Add(schedule);
        db.Customers.Add(customer);
        db.Bookings.Add(booking);
        await db.SaveChangesAsync();

        return (business.Id, service.Id, staff.Id, userId, booking.Id, startUtc);
    }

    private async Task<BookingEntity> GetBookingAsync(Guid bookingId)
    {
        using var scope = _fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BookingDbContext>();
        return (await db.Bookings.FindAsync(bookingId))!;
    }

    private static string MintToken(Guid userId, Guid businessId)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new(ClaimTypes.Email, "stella.staff@example.com"),
            new(ClaimTypes.Name, "Stella Staff"),
            new("businessId", businessId.ToString()),
            new(ClaimTypes.Role, "Staff")
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("integration-test-secret-key-that-is-long-enough-for-hs256"));
        var token = new JwtSecurityToken(
            issuer: "Booking",
            audience: "BookingClients",
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static async Task<T> ReadAsync<T>(HttpResponseMessage response)
    {
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
    }

    private sealed record CalendarEventDto(Guid Id, string Start, string End);
}