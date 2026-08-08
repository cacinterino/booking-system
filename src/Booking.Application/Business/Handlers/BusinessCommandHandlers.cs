using MediatR;
using Microsoft.Extensions.Logging;
using Booking.Application.Auth.DTOs;
using Booking.Application.Auth.Interfaces;
using Booking.Application.Business.Commands;
using Booking.Application.Business.DTOs;
using Booking.Application.Business.Interfaces;
using Booking.Domain;
using BusinessEntity = Booking.Domain.Business;
using StaffEntity = Booking.Domain.Staff;

namespace Booking.Application.Business.Handlers;

public class RegisterBusinessCommandHandler : IRequestHandler<RegisterBusinessCommand, AuthResponse>
{
    private readonly IUserManager _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IBusinessRepository _repository;
    private readonly IEmailService _emailService;
    private readonly ILogger<RegisterBusinessCommandHandler> _logger;

    public RegisterBusinessCommandHandler(
        IUserManager userManager,
        IJwtTokenService jwtTokenService,
        IBusinessRepository repository,
        IEmailService emailService,
        ILogger<RegisterBusinessCommandHandler> logger)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _repository = repository;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<AuthResponse> Handle(RegisterBusinessCommand request, CancellationToken cancellationToken)
    {
        var req = request.Request;

        var existingUser = await _userManager.FindByEmailAsync(req.Email);
        if (existingUser != null)
            throw new InvalidOperationException("Email already registered");

        var slug = req.BusinessSlug.Trim().ToLowerInvariant();
        if (await _repository.SlugExistsAsync(slug, cancellationToken))
            throw new InvalidOperationException("Business slug is already taken");

        var business = new BusinessEntity(req.BusinessName, slug, req.Description, req.Address, req.PhoneNumber, req.Email);
        await _repository.AddBusinessAsync(business, cancellationToken);

        var user = new ApplicationUser
        {
            UserName = req.Email,
            Email = req.Email,
            FullName = $"{req.FirstName} {req.LastName}",
            PhoneNumber = req.PhoneNumber,
            EmailConfirmed = true,
            BusinessId = business.Id
        };

        var result = await _userManager.CreateAsync(user, req.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Registration failed: {errors}");
        }

        await _userManager.AddToRoleAsync(user, "Admin");

        var owner = new StaffEntity(business.Id, req.FirstName, req.LastName, req.Email, req.PhoneNumber, user.Id)
        {
            // IsActive stays true; owner is always active
        };
        await _repository.AddAsync(owner, cancellationToken);

        await _repository.SaveChangesAsync(cancellationToken);

        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _jwtTokenService.GenerateAccessToken(user, roles);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();
        var expiresAt = _jwtTokenService.GetAccessTokenExpiry();

        await _emailService.SendWelcomeEmailAsync(req.Email, req.FirstName);
        _logger.LogInformation("Business registered: {BusinessName} ({Slug}) by {Email}", business.Name, business.Slug, req.Email);

        return new AuthResponse(
            accessToken,
            refreshToken,
            expiresAt,
            new UserDto(user.Id, user.Email, user.FullName, user.PhoneNumber, user.BusinessId, roles.ToArray()));
    }
}

public class InviteStaffCommandHandler : IRequestHandler<InviteStaffCommand, InvitationResponse>
{
    private readonly IUserManager _userManager;
    private readonly IBusinessRepository _repository;
    private readonly IEmailService _emailService;
    private readonly ILogger<InviteStaffCommandHandler> _logger;

    public InviteStaffCommandHandler(
        IUserManager userManager,
        IBusinessRepository repository,
        IEmailService emailService,
        ILogger<InviteStaffCommandHandler> logger)
    {
        _userManager = userManager;
        _repository = repository;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<InvitationResponse> Handle(InviteStaffCommand request, CancellationToken cancellationToken)
    {
        var business = await _repository.GetByIdAsync(request.BusinessId, cancellationToken);
        if (business == null)
            throw new KeyNotFoundException("Business not found");

        var req = request.Request;
        var role = string.Equals(req.Role, "Admin", StringComparison.OrdinalIgnoreCase) ? "Admin" : "Staff";

        var existingUser = await _userManager.FindByEmailAsync(req.Email);
        if (existingUser != null && existingUser.BusinessId == request.BusinessId)
            throw new InvalidOperationException("This user already belongs to your business");

        var rawToken = BusinessInvitation.GenerateToken();
        var expiresAt = DateTime.UtcNow.AddDays(7);
        var invitation = BusinessInvitation.Create(request.BusinessId, req.Email, role, rawToken, expiresAt);

        await _repository.AddAsync(invitation, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        var acceptUrl = $"{_emailService.GetBaseUrl()}/accept-invitation?token={Uri.EscapeDataString(rawToken)}";
        await _emailService.SendInvitationEmailAsync(req.Email, acceptUrl, business.Name);
        _logger.LogInformation("Staff invited: {Email} to {BusinessId} as {Role}", req.Email, request.BusinessId, role);

        return new InvitationResponse(
            invitation.Id,
            invitation.BusinessId,
            invitation.Email,
            invitation.Role,
            invitation.Status.ToString(),
            invitation.ExpiresAt,
            acceptUrl);
    }
}

public class AcceptInvitationCommandHandler : IRequestHandler<AcceptInvitationCommand, AuthResponse>
{
    private readonly IUserManager _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IBusinessRepository _repository;
    private readonly ILogger<AcceptInvitationCommandHandler> _logger;

    public AcceptInvitationCommandHandler(
        IUserManager userManager,
        IJwtTokenService jwtTokenService,
        IBusinessRepository repository,
        ILogger<AcceptInvitationCommandHandler> logger)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _repository = repository;
        _logger = logger;
    }

    public async Task<AuthResponse> Handle(AcceptInvitationCommand request, CancellationToken cancellationToken)
    {
        var req = request.Request;

        var invitation = await _repository.GetInvitationByTokenAsync(req.Token, cancellationToken);
        if (invitation == null || !invitation.IsValid(req.Token))
            throw new UnauthorizedAccessException("Invitation is invalid or has expired");

        if (!string.Equals(invitation.Email, req.Email, StringComparison.OrdinalIgnoreCase))
            throw new UnauthorizedAccessException("Invitation was sent to a different email");

        var user = await _userManager.FindByEmailAsync(req.Email);
        if (user != null)
            throw new InvalidOperationException("An account with this email already exists");

        user = new ApplicationUser
        {
            UserName = req.Email,
            Email = req.Email,
            FullName = $"{req.FirstName} {req.LastName}",
            PhoneNumber = req.PhoneNumber,
            EmailConfirmed = true,
            BusinessId = invitation.BusinessId
        };

        var result = await _userManager.CreateAsync(user, req.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Registration failed: {errors}");
        }

        await _userManager.AddToRoleAsync(user, invitation.Role);

        var staff = new StaffEntity(invitation.BusinessId, req.FirstName, req.LastName, req.Email, req.PhoneNumber, user.Id);
        await _repository.AddAsync(staff, cancellationToken);

        invitation.Accept(user.Id);
        await _repository.UpdateAsync(invitation, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _jwtTokenService.GenerateAccessToken(user, roles);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();
        var expiresAt = _jwtTokenService.GetAccessTokenExpiry();

        _logger.LogInformation("Invitation accepted by {Email} for business {BusinessId}", req.Email, invitation.BusinessId);

        return new AuthResponse(
            accessToken,
            refreshToken,
            expiresAt,
            new UserDto(user.Id, user.Email, user.FullName, user.PhoneNumber, user.BusinessId, roles.ToArray()));
    }
}