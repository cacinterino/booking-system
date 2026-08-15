using FluentAssertions;
using Moq;
using Booking.Application.Business.DTOs;
using Booking.Application.Business.Handlers;
using Booking.Application.Business.Interfaces;
using Booking.Application.Business.Queries;
using BusinessEntity = Booking.Domain.Business;

namespace Booking.UnitTests.Business;

public class GetPublicBusinessQueryHandlerTests
{
    private readonly Mock<IBusinessRepository> _repository = new();

    [Fact]
    public async Task Handle_SlugResolves_MapsBusinessAndSettings()
    {
        var business = new BusinessEntity("The Hair Room", "the-hair-room", "Manila's neighbourhood salon.");
        var expectedId = business.Id;
        business.UpdateSettings(new Booking.Domain.BusinessSettings
        {
            SlotIntervalMinutes = 30,
            AdvanceBookingDays = 14,
            RequireDeposit = true,
            DepositAmount = 150,
            Currency = "PHP"
        });

        _repository.Setup(r => r.GetBySlugAsync("the-hair-room", It.IsAny<CancellationToken>()))
            .ReturnsAsync(business);

        var handler = new GetPublicBusinessQueryHandler(_repository.Object);
        var result = await handler.Handle(new GetPublicBusinessQuery("the-hair-room"), CancellationToken.None);

        result.Should().BeEquivalentTo(new PublicBusinessResponse(
            expectedId,
            Name: "The Hair Room",
            Slug: "the-hair-room",
            Description: "Manila's neighbourhood salon.",
            Timezone: "Asia/Manila",
            RequireDeposit: true,
            DepositAmount: 150,
            Currency: "PHP",
            AdvanceBookingDays: 14,
            SlotIntervalMinutes: 30));
    }

    [Fact]
    public async Task Handle_UnknownSlug_ThrowsNotFound()
    {
        _repository.Setup(r => r.GetBySlugAsync("does-not-exist", It.IsAny<CancellationToken>()))
            .ReturnsAsync((BusinessEntity?)null);

        var handler = new GetPublicBusinessQueryHandler(_repository.Object);

        var act = async () => await handler.Handle(new GetPublicBusinessQuery("does-not-exist"), CancellationToken.None);

        await act.Should().ThrowAsync<KeyNotFoundException>().WithMessage("Business not found");
    }

    [Fact]
    public async Task Handle_DefaultSettings_MapsDefaults()
    {
        var business = new BusinessEntity("Nails Studio", "nails-studio");

        _repository.Setup(r => r.GetBySlugAsync("nails-studio", It.IsAny<CancellationToken>()))
            .ReturnsAsync(business);

        var handler = new GetPublicBusinessQueryHandler(_repository.Object);
        var result = await handler.Handle(new GetPublicBusinessQuery("nails-studio"), CancellationToken.None);

        result.RequireDeposit.Should().BeFalse();
        result.DepositAmount.Should().Be(100);
        result.Currency.Should().Be("PHP");
        result.AdvanceBookingDays.Should().Be(30);
        result.SlotIntervalMinutes.Should().Be(15);
        result.Timezone.Should().Be("Asia/Manila");
    }
}
