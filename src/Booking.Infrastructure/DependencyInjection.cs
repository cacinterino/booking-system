using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Booking.Application.Auth.Interfaces;
using Booking.Application.Availability.Interfaces;
using Booking.Application.Bookings.Interfaces;
using Booking.Application.Business.Interfaces;
using Booking.Application.Services.Interfaces;
using Booking.Application.Staff.Interfaces;
using Booking.Infrastructure.Auth;
using Booking.Infrastructure.Persistence.Repositories;
using IdentityUser = Booking.Infrastructure.Persistence.ApplicationUser;
using IdentityRole = Booking.Infrastructure.Persistence.ApplicationRole;
using Booking.Infrastructure.Persistence;

namespace Booking.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // DbContext
        services.AddDbContext<BookingDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        // Identity
        services.AddIdentity<IdentityUser, IdentityRole>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = true;
            options.Password.RequiredLength = 8;
            options.User.RequireUniqueEmail = true;
            options.SignIn.RequireConfirmedEmail = false;
        })
        .AddEntityFrameworkStores<BookingDbContext>()
        .AddDefaultTokenProviders();

        // JWT Settings
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();

        // JWT Authentication
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings.Issuer,
                ValidAudience = jwtSettings.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
                ClockSkew = TimeSpan.Zero
            };
        });

        // Authorization policies
        services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
            options.AddPolicy("StaffOrAdmin", policy => policy.RequireRole("Staff", "Admin"));
            options.AddPolicy("CustomerOnly", policy => policy.RequireRole("Customer"));
        });

        // Application services
        services.AddScoped<IUserManager, UserManagerService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPasswordHasher, PasswordHasherService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IDateTimeProvider, DateTimeProvider>();

        // Repositories
        services.AddScoped<IServiceRepository, ServiceRepository>();
        services.AddScoped<IStaffRepository, StaffRepository>();
        services.AddScoped<IBusinessRepository, BusinessRepository>();
        services.AddScoped<IAvailabilityRepository, AvailabilityRepository>();
        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<IAvailabilityCache, AvailabilityCache>();

        // Caching for availability engine
        services.AddMemoryCache();

        return services;
    }
}