using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Booking.Application.Auth.Interfaces;
using Booking.Application.Business.Commands;
using Booking.Application.Business.DTOs;
using Booking.Application.Business.Handlers;
using Booking.Application.Business.Interfaces;
using Booking.Domain;
using BusinessEntity = Booking.Domain.Business;
using StaffEntity = Booking.Domain.Staff;

namespace Booking.UnitTests.Business;

public class BusinessInvitationTests
{
    [Fact]
    public void Create_HashesToken_AndValidates()
    {
        var rawToken = BusinessInvitation.GenerateToken();
        var invitation = BusinessInvitation.Create(Guid.NewGuid(), "staff@test.com", "Staff", rawToken, DateTime.UtcNow.AddDays(7));

        invitation.TokenHash.Should().NotBe(rawToken);
        invitation.TokenHash.Should().Be(BusinessInvitation.HashToken(rawToken));
        invitation.Status.Should().Be(InvitationStatus.Pending);
        invitation.IsValid(rawToken).Should().BeTrue();
        invitation.IsValid("wrong-token").Should().BeFalse();
    }

    [Fact]
    public void IsValid_ExpiredInvitation_ReturnsFalse()
    {
        var rawToken = BusinessInvitation.GenerateToken();
        var invitation = BusinessInvitation.Create(Guid.NewGuid(), "staff@test.com", "Staff", rawToken, DateTime.UtcNow.AddMinutes(-1));

        invitation.IsValid(rawToken).Should().BeFalse();
    }

    [Fact]
    public void Accept_MarksAcceptedAndSetsUser()
    {
        var rawToken = BusinessInvitation.GenerateToken();
        var invitation = BusinessInvitation.Create(Guid.NewGuid(), "staff@test.com", "Staff", rawToken, DateTime.UtcNow.AddDays(7));
        var userId = Guid.NewGuid();

        invitation.Accept(userId);

        invitation.Status.Should().Be(InvitationStatus.Accepted);
        invitation.AcceptedByUserId.Should().Be(userId);
        invitation.AcceptedAt.Should().NotBeNull();
        invitation.IsValid(rawToken).Should().BeFalse();
    }
}

public class RegisterBusinessCommandHandlerTests
{
    private readonly Mock<IUserManager> _userManager = new();
    private readonly Mock<IJwtTokenService> _jwt = new();
    private readonly Mock<IBusinessRepository> _repository = new();
    private readonly Mock<IEmailService> _email = new();
    private readonly NullLogger<RegisterBusinessCommandHandler> _logger = new();

    [Fact]
    public async Task Handle_ValidRequest_CreatesBusinessOwnerAndStaff()
    {
        var request = new RegisterBusinessCommand(new RegisterBusinessRequest(
            "Nails Studio", "nails-studio", "owner@test.com", "S3cure!Pass", "Maria", "Santos", "09171112222"));

        _userManager.Setup(u => u.FindByEmailAsync("owner@test.com")).ReturnsAsync((ApplicationUser?)null);
        _repository.Setup(r => r.SlugExistsAsync("nails-studio", It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _userManager.Setup(u => u.CreateAsync(It.IsAny<ApplicationUser>(), "S3cure!Pass"))
            .ReturnsAsync(IdentityResult.Success)
            .Callback<ApplicationUser, string>((u, _) => u.Id = Guid.NewGuid());
        _userManager.Setup(u => u.AddToRoleAsync(It.IsAny<ApplicationUser>(), "Admin")).ReturnsAsync(IdentityResult.Success);
        _userManager.Setup(u => u.GetRolesAsync(It.IsAny<ApplicationUser>())).ReturnsAsync(new[] { "Admin" });
        _jwt.Setup(j => j.GenerateAccessToken(It.IsAny<ApplicationUser>(), It.IsAny<IEnumerable<string>>())).Returns("token");
        _jwt.Setup(j => j.GenerateRefreshToken()).Returns("refresh");
        _jwt.Setup(j => j.GetAccessTokenExpiry()).Returns(DateTime.UtcNow.AddMinutes(15));

        var handler = new RegisterBusinessCommandHandler(_userManager.Object, _jwt.Object, _repository.Object, _email.Object, _logger);
        var result = await handler.Handle(request, CancellationToken.None);

        result.AccessToken.Should().Be("token");
        result.User.Roles.Should().Contain("Admin");
        result.User.BusinessId.Should().NotBeNull();

        _repository.Verify(r => r.AddBusinessAsync(It.IsAny<BusinessEntity>(), It.IsAny<CancellationToken>()), Times.Once);
        _repository.Verify(r => r.AddAsync(It.Is<StaffEntity>(s => s.UserId != null && s.BusinessId == result.User.BusinessId), It.IsAny<CancellationToken>()), Times.Once);
        _repository.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_DuplicateEmail_Throws()
    {
        var request = new RegisterBusinessCommand(new RegisterBusinessRequest(
            "Nails Studio", "nails-studio", "owner@test.com", "S3cure!Pass", "Maria", "Santos"));

        _userManager.Setup(u => u.FindByEmailAsync("owner@test.com"))
            .ReturnsAsync(new ApplicationUser { Email = "owner@test.com", BusinessId = Guid.NewGuid() });

        var handler = new RegisterBusinessCommandHandler(_userManager.Object, _jwt.Object, _repository.Object, _email.Object, _logger);

        var act = async () => await handler.Handle(request, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already registered*");
        _repository.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_TakenSlug_Throws()
    {
        var request = new RegisterBusinessCommand(new RegisterBusinessRequest(
            "Nails Studio", "nails-studio", "owner@test.com", "S3cure!Pass", "Maria", "Santos"));

        _userManager.Setup(u => u.FindByEmailAsync("owner@test.com")).ReturnsAsync((ApplicationUser?)null);
        _repository.Setup(r => r.SlugExistsAsync("nails-studio", It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var handler = new RegisterBusinessCommandHandler(_userManager.Object, _jwt.Object, _repository.Object, _email.Object, _logger);

        var act = async () => await handler.Handle(request, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*slug*");
    }
}

public class AcceptInvitationCommandHandlerTests
{
    private readonly Mock<IUserManager> _userManager = new();
    private readonly Mock<IJwtTokenService> _jwt = new();
    private readonly Mock<IBusinessRepository> _repository = new();
    private readonly NullLogger<AcceptInvitationCommandHandler> _logger = new();

    [Fact]
    public async Task Handle_ValidInvitation_CreatesStaffUser()
    {
        var businessId = Guid.NewGuid();
        var rawToken = BusinessInvitation.GenerateToken();
        var invitation = BusinessInvitation.Create(businessId, "staff@test.com", "Staff", rawToken, DateTime.UtcNow.AddDays(7));
        var request = new AcceptInvitationCommand(new AcceptInvitationRequest(
            rawToken, "staff@test.com", "S3cure!Pass", "Ana", "Cruz"));

        _repository.Setup(r => r.GetInvitationByTokenAsync(rawToken, It.IsAny<CancellationToken>())).ReturnsAsync(invitation);
        _userManager.Setup(u => u.FindByEmailAsync("staff@test.com")).ReturnsAsync((ApplicationUser?)null);
        _userManager.Setup(u => u.CreateAsync(It.IsAny<ApplicationUser>(), "S3cure!Pass"))
            .ReturnsAsync(IdentityResult.Success)
            .Callback<ApplicationUser, string>((u, _) => u.Id = Guid.NewGuid());
        _userManager.Setup(u => u.AddToRoleAsync(It.IsAny<ApplicationUser>(), "Staff")).ReturnsAsync(IdentityResult.Success);
        _userManager.Setup(u => u.GetRolesAsync(It.IsAny<ApplicationUser>())).ReturnsAsync(new[] { "Staff" });
        _jwt.Setup(j => j.GenerateAccessToken(It.IsAny<ApplicationUser>(), It.IsAny<IEnumerable<string>>())).Returns("token");
        _jwt.Setup(j => j.GenerateRefreshToken()).Returns("refresh");
        _jwt.Setup(j => j.GetAccessTokenExpiry()).Returns(DateTime.UtcNow.AddMinutes(15));

        var handler = new AcceptInvitationCommandHandler(_userManager.Object, _jwt.Object, _repository.Object, _logger);
        var result = await handler.Handle(request, CancellationToken.None);

        result.User.Roles.Should().Contain("Staff");
        result.User.BusinessId.Should().Be(businessId);
        invitation.Status.Should().Be(InvitationStatus.Accepted);

        _repository.Verify(r => r.AddAsync(It.Is<StaffEntity>(s => s.UserId != null && s.BusinessId == businessId), It.IsAny<CancellationToken>()), Times.Once);
        _repository.Verify(r => r.UpdateAsync(invitation, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_InvalidToken_Throws()
    {
        var request = new AcceptInvitationCommand(new AcceptInvitationRequest(
            "bad-token", "staff@test.com", "S3cure!Pass", "Ana", "Cruz"));

        _repository.Setup(r => r.GetInvitationByTokenAsync("bad-token", It.IsAny<CancellationToken>())).ReturnsAsync((BusinessInvitation?)null);

        var handler = new AcceptInvitationCommandHandler(_userManager.Object, _jwt.Object, _repository.Object, _logger);

        var act = async () => await handler.Handle(request, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*invalid*");
    }

    [Fact]
    public async Task Handle_EmailMismatch_Throws()
    {
        var businessId = Guid.NewGuid();
        var rawToken = BusinessInvitation.GenerateToken();
        var invitation = BusinessInvitation.Create(businessId, "different@test.com", "Staff", rawToken, DateTime.UtcNow.AddDays(7));
        var request = new AcceptInvitationCommand(new AcceptInvitationRequest(
            rawToken, "staff@test.com", "S3cure!Pass", "Ana", "Cruz"));

        _repository.Setup(r => r.GetInvitationByTokenAsync(rawToken, It.IsAny<CancellationToken>())).ReturnsAsync(invitation);
        _userManager.Setup(u => u.FindByEmailAsync("staff@test.com")).ReturnsAsync((ApplicationUser?)null);

        var handler = new AcceptInvitationCommandHandler(_userManager.Object, _jwt.Object, _repository.Object, _logger);

        var act = async () => await handler.Handle(request, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*different email*");
        _repository.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}