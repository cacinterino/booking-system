using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using AppUser = Booking.Application.Auth.Interfaces.ApplicationUser;
using AppIdentityResult = Booking.Application.Auth.Interfaces.IdentityResult;
using AppIdentityError = Booking.Application.Auth.Interfaces.IdentityError;
using Booking.Application.Auth.Interfaces;
using IdentityUser = Booking.Infrastructure.Persistence.ApplicationUser;
using IdentityRole = Booking.Infrastructure.Persistence.ApplicationRole;
using Booking.Infrastructure.Persistence;

namespace Booking.Infrastructure.Auth;

public class UserManagerService : IUserManager
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly BookingDbContext _context;

    public UserManagerService(
        UserManager<IdentityUser> userManager,
        RoleManager<IdentityRole> roleManager,
        BookingDbContext context)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
    }

    public async Task<AppUser?> FindByEmailAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        return user != null ? MapToAppUser(user) : null;
    }

    public async Task<AppUser?> FindByIdAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        return user != null ? MapToAppUser(user) : null;
    }

    public async Task<AppIdentityResult> CreateAsync(AppUser user, string password)
    {
        var identityUser = MapToIdentityUser(user);
        var result = await _userManager.CreateAsync(identityUser, password);
        user.Id = identityUser.Id; // Update with generated ID
        return MapIdentityResult(result);
    }

    public async Task<AppIdentityResult> AddToRoleAsync(AppUser user, string role)
    {
        if (!await _roleManager.RoleExistsAsync(role))
        {
            await _roleManager.CreateAsync(new IdentityRole { Name = role, Description = $"{role} role" });
        }
        var identityUser = await _userManager.FindByIdAsync(user.Id.ToString());
        if (identityUser == null) return AppIdentityResult.Failed(new AppIdentityError { Code = "UserNotFound", Description = "User not found" });
        
        var result = await _userManager.AddToRoleAsync(identityUser, role);
        return MapIdentityResult(result);
    }

    public async Task<IList<string>> GetRolesAsync(AppUser user)
    {
        var identityUser = await _userManager.FindByIdAsync(user.Id.ToString());
        if (identityUser == null) return new List<string>();
        return await _userManager.GetRolesAsync(identityUser);
    }

    public async Task<bool> CheckPasswordAsync(AppUser user, string password)
    {
        var identityUser = await _userManager.FindByIdAsync(user.Id.ToString());
        if (identityUser == null) return false;
        return await _userManager.CheckPasswordAsync(identityUser, password);
    }

    public async Task<AppIdentityResult> ChangePasswordAsync(AppUser user, string currentPassword, string newPassword)
    {
        var identityUser = await _userManager.FindByIdAsync(user.Id.ToString());
        if (identityUser == null) return AppIdentityResult.Failed(new AppIdentityError { Code = "UserNotFound", Description = "User not found" });
        
        var result = await _userManager.ChangePasswordAsync(identityUser, currentPassword, newPassword);
        return MapIdentityResult(result);
    }

    public async Task<AppIdentityResult> ResetPasswordAsync(AppUser user, string token, string newPassword)
    {
        var identityUser = await _userManager.FindByIdAsync(user.Id.ToString());
        if (identityUser == null) return AppIdentityResult.Failed(new AppIdentityError { Code = "UserNotFound", Description = "User not found" });
        
        var result = await _userManager.ResetPasswordAsync(identityUser, token, newPassword);
        return MapIdentityResult(result);
    }

    public async Task<string> GeneratePasswordResetTokenAsync(AppUser user)
    {
        var identityUser = await _userManager.FindByIdAsync(user.Id.ToString());
        if (identityUser == null) throw new InvalidOperationException("User not found");
        return await _userManager.GeneratePasswordResetTokenAsync(identityUser);
    }

    public async Task<AppIdentityResult> UpdateAsync(AppUser user)
    {
        var identityUser = await _userManager.FindByIdAsync(user.Id.ToString());
        if (identityUser == null) return AppIdentityResult.Failed(new AppIdentityError { Code = "UserNotFound", Description = "User not found" });
        
        identityUser.FullName = user.FullName;
        identityUser.PhoneNumber = user.PhoneNumber;
        identityUser.Email = user.Email;
        identityUser.UserName = user.Email;
        identityUser.BusinessId = user.BusinessId;
        identityUser.EmailConfirmed = user.EmailConfirmed;
        identityUser.IsActive = user.IsActive;

        var result = await _userManager.UpdateAsync(identityUser);
        return MapIdentityResult(result);
    }

    private static AppUser MapToAppUser(IdentityUser user)
    {
        return new AppUser
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            BusinessId = user.BusinessId,
            EmailConfirmed = user.EmailConfirmed,
            IsActive = user.IsActive
        };
    }

    private static IdentityUser MapToIdentityUser(AppUser user)
    {
        return new IdentityUser
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            BusinessId = user.BusinessId,
            EmailConfirmed = user.EmailConfirmed,
            IsActive = user.IsActive
        };
    }

    private static AppIdentityResult MapIdentityResult(Microsoft.AspNetCore.Identity.IdentityResult result)
    {
        return new AppIdentityResult
        {
            Succeeded = result.Succeeded,
            Errors = result.Errors.Select(e => new AppIdentityError { Code = e.Code, Description = e.Description })
        };
    }
}