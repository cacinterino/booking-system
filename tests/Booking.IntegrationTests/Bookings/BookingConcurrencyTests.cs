using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Booking.Domain;
using Booking.Infrastructure.Persistence;

namespace Booking.IntegrationTests;

[Collection("BookingApi")]
public class BookingConcurrencyTests
{
    private readonly BookingApiFixture _fixture;

    public BookingConcurrencyTests(BookingApiFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task ConcurrentSameSlot_DifferentKeys_ExactlyOne201_One409_Never500()
    {
        // ---- Seed: business + staff + service + weekly schedule on a future Friday ----
        var (businessId, serviceId, staffId, slotStartUtc) = await SeedAsync();

        var client = _fixture.Factory.CreateClient();
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var body = new
        {
            businessId,
            serviceId,
            staffId,
            startTime = slotStartUtc.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            notes = "concurrency test",
            guestContact = new { name = "Concurrent Guest", email = "race@example.com", phone = "639170000001" }
        };

        var payload = JsonSerializer.Serialize(body);

        var reqA = BuildPost(client, payload, "race-key-a");
        var reqB = BuildPost(client, payload, "race-key-b");

        // Fire both concurrently.
        var tasks = new[] { client.SendAsync(reqA), client.SendAsync(reqB) };
        var responses = await Task.WhenAll(tasks);

        var codes = responses.Select(r => r.StatusCode).OrderBy(c => c).ToArray();
        codes.Should().Equal(new[] { HttpStatusCode.Created, HttpStatusCode.Conflict },
            "exactly one booking must win the slot, the other gets a clean 409");

        responses.Should().NotContain(r => r.StatusCode == HttpStatusCode.InternalServerError,
            "a double-booking race must never surface as a 500");
    }

    private HttpRequestMessage BuildPost(HttpClient client, string json, string key)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/api/bookings")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        request.Headers.TryAddWithoutValidation("Idempotency-Key", key);
        return request;
    }

    private async Task<(Guid BusinessId, Guid ServiceId, Guid StaffId, DateTime StartUtc)> SeedAsync()
    {
        using var scope = _fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BookingDbContext>();

        var business = new Business("Concurrency Barbershop", "concurrency-barbershop");
        var service = new Service(business.Id, "Express Cut", 60, 500m);
        var staff = new Staff(business.Id, "Race", "Staff", "race.staff@example.com");
        staff.AddService(service.Id);
        // Friday 2026-08-14 at 10:00 Manila == 02:00 UTC.
        var localDate = new DateOnly(2026, 8, 14);
        var schedule = new StaffSchedule(staff.Id, localDate.DayOfWeek, new TimeSpan(9, 0, 0), new TimeSpan(17, 0, 0));
        var startUtc = new DateTime(localDate.Year, localDate.Month, localDate.Day, 2, 0, 0, DateTimeKind.Utc);

        db.Businesses.Add(business);
        db.Services.Add(service);
        db.Staff.Add(staff);
        db.StaffSchedules.Add(schedule);
        await db.SaveChangesAsync();

        return (business.Id, service.Id, staff.Id, startUtc);
    }
}