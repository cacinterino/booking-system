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
        var (businessId, serviceId, staffId, slotStartUtc) = await SeedAsync("concurrency-barbershop");

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

    [Fact]
    public async Task AdjacentSlots_BothSucceed_BackToBackNoConflict()
    {
        // Regression for half-open '[)' exclusion range: adjacent slots share only a boundary
        // (e.g. 10:00-11:00 and 11:00-12:00 Manila) and must NOT be treated as overlapping.
        var (businessId, serviceId, staffId, slotStartUtc) = await SeedAsync("adjacent-barbershop");

        var client = _fixture.Factory.CreateClient();
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var firstStart = slotStartUtc; // 10:00 Manila
        var secondStart = firstStart.AddHours(1); // 11:00 Manila, shares only the boundary

        var firstReq = new HttpRequestMessage(HttpMethod.Post, "/api/bookings")
        {
            Content = new StringContent(JsonSerializer.Serialize(new
            {
                businessId,
                serviceId,
                staffId,
                startTime = firstStart.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                guestContact = new { name = "Adjacent One", email = "adj1@example.com" }
            }), Encoding.UTF8, "application/json")
        };
        firstReq.Headers.TryAddWithoutValidation("Idempotency-Key", "adj-key-1");
        var first = await client.SendAsync(firstReq);
        first.StatusCode.Should().Be(HttpStatusCode.Created);

        var secondReq = new HttpRequestMessage(HttpMethod.Post, "/api/bookings")
        {
            Content = new StringContent(JsonSerializer.Serialize(new
            {
                businessId,
                serviceId,
                staffId,
                startTime = secondStart.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                guestContact = new { name = "Adjacent Two", email = "adj2@example.com" }
            }), Encoding.UTF8, "application/json")
        };
        secondReq.Headers.TryAddWithoutValidation("Idempotency-Key", "adj-key-2");
        var second = await client.SendAsync(secondReq);
        second.StatusCode.Should().Be(HttpStatusCode.Created,
            "back-to-back bookings sharing only an endpoint must both succeed");
    }

    [Fact]
    public async Task OverlappingSlot_Returns409()
    {
        var (businessId, serviceId, staffId, slotStartUtc) = await SeedAsync("overlap-barbershop");

        var client = _fixture.Factory.CreateClient();
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var payloadStart = slotStartUtc;

        var first = new HttpRequestMessage(HttpMethod.Post, "/api/bookings")
        {
            Content = new StringContent(JsonSerializer.Serialize(new
            {
                businessId,
                serviceId,
                staffId,
                startTime = payloadStart.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                guestContact = new { name = "Overlap One", email = "ovl1@example.com" }
            }), Encoding.UTF8, "application/json")
        };
        first.Headers.TryAddWithoutValidation("Idempotency-Key", "ovl-key-1");
        var firstResp = await client.SendAsync(first);
        firstResp.StatusCode.Should().Be(HttpStatusCode.Created);

        // 10:30 Manila overlaps 10:00-11:00 -> must be rejected.
        var second = new HttpRequestMessage(HttpMethod.Post, "/api/bookings")
        {
            Content = new StringContent(JsonSerializer.Serialize(new
            {
                businessId,
                serviceId,
                staffId,
                startTime = payloadStart.AddMinutes(30).ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                guestContact = new { name = "Overlap Two", email = "ovl2@example.com" }
            }), Encoding.UTF8, "application/json")
        };
        second.Headers.TryAddWithoutValidation("Idempotency-Key", "ovl-key-2");
        var secondResp = await client.SendAsync(second);
        secondResp.StatusCode.Should().Be(HttpStatusCode.Conflict);
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

    private async Task<(Guid BusinessId, Guid ServiceId, Guid StaffId, DateTime StartUtc)> SeedAsync(string slug)
    {
        using var scope = _fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BookingDbContext>();

        var business = new Business($"Concurrency {slug}", slug);
        var service = new Service(business.Id, "Express Cut", 60, 500m);
        var staff = new Staff(business.Id, "Race", "Staff", $"{slug}.staff@example.com");
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