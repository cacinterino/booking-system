using FluentAssertions;
using Booking.Application.Staff.DTOs;
using Booking.Application.Staff.Handlers;

namespace Booking.UnitTests.Staff;

public class PublicStaffMapperTests
{
    [Fact]
    public void ToPublic_StripsPiiAndKeepsIdentity()
    {
        var staffId = Guid.NewGuid();
        var serviceIds = new[] { Guid.NewGuid(), Guid.NewGuid() };
        var staff = new StaffResponse(
            staffId,
            "Ana",
            "Reyes",
            "Ana Reyes",
            "ana@example.com",
            "09171234567",
            "https://avatar.example.com/ana.png",
            Guid.NewGuid(),
            true,
            2,
            Guid.NewGuid(),
            serviceIds);

        var result = PublicStaffMapper.ToPublic(staff);

        result.Id.Should().Be(staffId);
        result.FullName.Should().Be("Ana Reyes");
        result.DisplayOrder.Should().Be(2);
        result.ServiceIds.Should().Equal(serviceIds);

        var serialized = System.Text.Json.JsonSerializer.Serialize(result);
        serialized.Should().NotContain("ana@example.com");
        serialized.Should().NotContain("09171234567");
        serialized.Should().NotContain("avatar");
    }

    [Fact]
    public void ToPublic_KeepsNullSafeWithoutPii()
    {
        var staff = new StaffResponse(
            Guid.NewGuid(),
            "Juan",
            "Dela Cruz",
            "Juan Dela Cruz",
            Email: null,
            Phone: null,
            AvatarUrl: null,
            Guid.NewGuid(),
            true,
            0,
            null,
            Array.Empty<Guid>());

        var result = PublicStaffMapper.ToPublic(staff);

        result.FullName.Should().Be("Juan Dela Cruz");
        result.ServiceIds.Should().BeEmpty();
        result.DisplayOrder.Should().Be(0);
    }
}
