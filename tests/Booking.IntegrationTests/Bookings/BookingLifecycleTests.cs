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
public class BookingLifecycleTests
{
    private readonly BookingApiFixture _fixture;

    public BookingLifecycleTests(BookingApiFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Create_MyBookings_Cancel_SlotReopensRoundTrip()
    {
        var (businessId, serviceId, staffId, slotStartUtc) = await SeedAsync();
        var client = _fixture.Factory.CreateClient();
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var payload = JsonSerializer.Serialize(new
        {
            businessId,
            serviceId,
            staffId,
            startTime = slotStartUtc.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            notes = "lifecycle test",
            guestContact = new { name = "Lily Guest", email = "lily@example.com", phone = "639170000002" }
        });

        // 1. Create booking.
        var createRequest = new HttpRequestMessage(HttpMethod.Post, "/api/bookings")
        {
            Content = new StringContent(payload, Encoding.UTF8, "application/json")
        };
        createRequest.Headers.TryAddWithoutValidation("Idempotency-Key", "lifecycle-test-key-1");
        var createResponse = await client.SendAsync(createRequest);
        createResponse.StatusCode.Should().Be(HttpStatusCode.Created,
            $"create failed with body: {await createResponse.Content.ReadAsStringAsync()}");
        var created = await ReadAsync<BookingDto>(createResponse);
        created.Id.Should().NotBeEmpty();
        created.AccessCode.Should().NotBeNullOrEmpty();

        // 2. Guest lists my bookings via access code.
        var mineResponse = await client.GetAsync($"/api/bookings/my-bookings?accessCode={created.AccessCode}");
        mineResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var mine = await ReadAsync<List<BookingDto>>(mineResponse);
        mine.Should().ContainSingle(b => b.Id == created.Id);

        // 3. Cancel.
        var cancelPayload = JsonSerializer.Serialize(new { reason = "decided to reschedule myself", accessCode = created.AccessCode });
        var cancelRequest = new HttpRequestMessage(HttpMethod.Post, $"/api/bookings/{created.Id}/cancel")
        {
            Content = new StringContent(cancelPayload, Encoding.UTF8, "application/json")
        };
        var cancelResponse = await client.SendAsync(cancelRequest);
        cancelResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // 4. Same slot is bookable again: a second create succeeds with a new idempotency key.
        var secondPayload = JsonSerializer.Serialize(new
        {
            businessId,
            serviceId,
            staffId,
            startTime = slotStartUtc.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            notes = "rebook after cancel",
            guestContact = new { name = "Lily Guest", email = "lily@example.com", phone = "639170000002" }
        });
        var retry = new HttpRequestMessage(HttpMethod.Post, "/api/bookings")
        {
            Content = new StringContent(secondPayload, Encoding.UTF8, "application/json")
        };
        retry.Headers.TryAddWithoutValidation("Idempotency-Key", "rebook-after-cancel-1");

        var rebookResponse = await client.SendAsync(retry);
        rebookResponse.StatusCode.Should().Be(HttpStatusCode.Created,
            "a cancelled booking must free the EXCLUDE-constrained slot for reuse");
    }

    private async Task<(Guid BusinessId, Guid ServiceId, Guid StaffId, DateTime StartUtc)> SeedAsync()
    {
        using var scope = _fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BookingDbContext>();

        var business = new Business("Lifecycle Barbershop", "lifecycle-barbershop");
        var service = new Service(business.Id, "Lifecycle Cut", 60, 500m);
        var staff = new Staff(business.Id, "Lyle", "Staff", "lyle.staff@example.com");
        staff.AddService(service.Id);
        // Saturday 2026-08-15 at 10:00 Manila == 02:00 UTC.
        var localDate = new DateOnly(2026, 8, 15);
        var schedule = new StaffSchedule(staff.Id, localDate.DayOfWeek, new TimeSpan(9, 0, 0), new TimeSpan(17, 0, 0));
        var startUtc = new DateTime(localDate.Year, localDate.Month, localDate.Day, 2, 0, 0, DateTimeKind.Utc);

        db.Businesses.Add(business);
        db.Services.Add(service);
        db.Staff.Add(staff);
        db.StaffSchedules.Add(schedule);
        await db.SaveChangesAsync();

        return (business.Id, service.Id, staff.Id, startUtc);
    }

    private static async Task<T> ReadAsync<T>(HttpResponseMessage response)
    {
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
    }

    private sealed record BookingDto(Guid Id, string? AccessCode);
}