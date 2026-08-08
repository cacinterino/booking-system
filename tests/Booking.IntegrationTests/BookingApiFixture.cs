using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;
using Booking.Infrastructure.Persistence;

namespace Booking.IntegrationTests;

/// <summary>
/// Spins up a disposable Postgres container with migrations applied, and a
/// WebApplicationFactory wired to it. Shared per test collection so the
/// concurrent race test runs against a real database.
/// </summary>
public sealed class BookingApiFixture : IAsyncLifetime
{
    private PostgreSqlContainer? _container;

    public WebApplicationFactory<Program> Factory { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        _container = new PostgreSqlBuilder("postgres:16-alpine")
            .WithDatabase("booking_test")
            .WithUsername("booking")
            .WithPassword("booking")
            .Build();
        await _container.StartAsync();

        Factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseSetting("ConnectionStrings:DefaultConnection", _container.GetConnectionString());
                builder.UseSetting("Jwt:Key", "integration-test-secret-key-that-is-long-enough-for-hs256");
                builder.UseSetting("Jwt:Issuer", "Booking");
                builder.UseSetting("Jwt:Audience", "BookingClients");
            });

        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BookingDbContext>();
        await db.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        await Factory.DisposeAsync();
        if (_container is not null)
            await _container.DisposeAsync();
    }
}

[CollectionDefinition("BookingApi")]
public class BookingApiCollection : ICollectionFixture<BookingApiFixture>
{
}