using FluentAssertions;
using Booking.Application.Services.DTOs;
using Booking.Application.Services.Validators;

namespace Booking.UnitTests.Services;

public class ServiceRequestValidatorTests
{
    private readonly ServiceRequestValidator _validator = new();

    [Theory]
    [InlineData("", 45, 100)]
    [InlineData("   ", 45, 100)]
    public void Validate_Valid_NameRequired_Throws(string name, int duration, decimal price)
    {
        var result = _validator.Validate(new ServiceRequest(name, duration, price));
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void Validate_ZeroDuration_Throws()
    {
        var result = _validator.Validate(new ServiceRequest("Manicure", 0, 100));
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "DurationMinutes");
    }

    [Fact]
    public void Validate_NegativePrice_Throws()
    {
        var result = _validator.Validate(new ServiceRequest("Manicure", 45, -5));
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Price");
    }

    [Fact]
    public void Validate_InvalidHexColor_Throws()
    {
        var result = _validator.Validate(new ServiceRequest("Manicure", 45, 100, Color: "red"));
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Color");
    }

    [Fact]
    public void Validate_ValidRequest_Passes()
    {
        var result = _validator.Validate(new ServiceRequest("Manicure", 45, 250.00m, Color: "#B8862B"));
        result.IsValid.Should().BeTrue();
    }
}

public class ServiceCategoryRequestValidatorTests
{
    private readonly ServiceCategoryRequestValidator _validator = new();

    [Fact]
    public void Validate_EmptyName_Throws()
    {
        var result = _validator.Validate(new ServiceCategoryRequest(""));
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Name");
    }

    [Fact]
    public void Validate_Valid_Request_Passes()
    {
        var result = _validator.Validate(new ServiceCategoryRequest("Nails", "Nail services", 1));
        result.IsValid.Should().BeTrue();
    }
}