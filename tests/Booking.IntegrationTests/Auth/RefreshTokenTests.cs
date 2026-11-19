using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;

namespace Booking.IntegrationTests;

[Collection("BookingApi")]
public class RefreshTokenTests
{
    private readonly BookingApiFixture _fixture;

    public RefreshTokenTests(BookingApiFixture fixture)
    {
        _fixture = fixture;
    }

    private sealed record AuthDto(string AccessToken, string RefreshToken);

    [Fact]
    public async Task RefreshToken_IsRejectedAsBearer_ButWorksAtRefreshEndpoint()
    {
        var client = _fixture.Factory.CreateClient();
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        var email = $"refresh.{Guid.NewGuid():N}@example.com";
        var registerPayload = JsonSerializer.Serialize(new
        {
            email,
            password = "Test123!",
            firstName = "Refresh",
            lastName = "Tester"
        });

        var registerResponse = await client.PostAsync("/api/auth/register",
            new StringContent(registerPayload, Encoding.UTF8, "application/json"));
        registerResponse.StatusCode.Should().Be(HttpStatusCode.OK,
            $"register failed with body: {await registerResponse.Content.ReadAsStringAsync()}");

        var auth = JsonSerializer.Deserialize<AuthDto>(
            await registerResponse.Content.ReadAsStringAsync(),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;

        // The access token authenticates.
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.AccessToken);
        (await client.GetAsync("/api/auth/me")).StatusCode.Should().Be(HttpStatusCode.OK);

        // The refresh token must not be accepted by the bearer middleware.
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.RefreshToken);
        (await client.GetAsync("/api/auth/me")).StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // Neither can an access token be replayed at /refresh.
        client.DefaultRequestHeaders.Authorization = null;
        var replayPayload = JsonSerializer.Serialize(new { refreshToken = auth.AccessToken });
        var replayResponse = await client.PostAsync("/api/auth/refresh",
            new StringContent(replayPayload, Encoding.UTF8, "application/json"));
        replayResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // The real refresh token exchanges for a working access token.
        var refreshPayload = JsonSerializer.Serialize(new { refreshToken = auth.RefreshToken });
        var refreshResponse = await client.PostAsync("/api/auth/refresh",
            new StringContent(refreshPayload, Encoding.UTF8, "application/json"));
        refreshResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var refreshed = JsonSerializer.Deserialize<AuthDto>(
            await refreshResponse.Content.ReadAsStringAsync(),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
        refreshed.AccessToken.Should().NotBeNullOrEmpty();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", refreshed.AccessToken);
        (await client.GetAsync("/api/auth/me")).StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
