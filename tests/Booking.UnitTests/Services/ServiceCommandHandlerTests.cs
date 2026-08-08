using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Booking.Application.Services.Commands;
using Booking.Application.Services.DTOs;
using Booking.Application.Services.Handlers;
using Booking.Application.Services.Interfaces;
using Booking.Domain;

namespace Booking.UnitTests.Services;

public class CreateServiceCommandHandlerTests
{
    private readonly Mock<IServiceRepository> _repository = new();
    private readonly NullLogger<CreateServiceCommandHandler> _logger = new();

    [Fact]
    public async Task Handle_ValidRequest_CreatesService()
    {
        var businessId = Guid.NewGuid();
        var category = new ServiceCategory(businessId, "Nails", null, 0);
        var request = new CreateServiceCommand(businessId, new ServiceRequest("Manicure", 45, 250.00m, category.Id));

        _repository.Setup(r => r.NameExistsAsync(businessId, "Manicure", null, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _repository.Setup(r => r.GetCategoryByIdAsync(businessId, category.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(category);

        var handler = new CreateServiceCommandHandler(_repository.Object, _logger);
        var result = await handler.Handle(request, CancellationToken.None);

        result.Name.Should().Be("Manicure");
        result.DurationMinutes.Should().Be(45);
        result.Price.Should().Be(250.00m);
        result.CategoryId.Should().Be(category.Id);
        result.CategoryName.Should().Be("Nails");
        result.BusinessId.Should().Be(businessId);

        _repository.Verify(r => r.AddServiceAsync(It.Is<Service>(s => s.Name == "Manicure"), It.IsAny<CancellationToken>()), Times.Once);
        _repository.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_DuplicateName_Throws()
    {
        var businessId = Guid.NewGuid();
        var request = new CreateServiceCommand(businessId, new ServiceRequest("Manicure", 45, 250.00m));

        _repository.Setup(r => r.NameExistsAsync(businessId, "Manicure", null, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var handler = new CreateServiceCommandHandler(_repository.Object, _logger);

        var act = async () => await handler.Handle(request, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already exists*");

        _repository.Verify(r => r.AddServiceAsync(It.IsAny<Service>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}

public class UpdateServiceCommandHandlerTests
{
    private readonly Mock<IServiceRepository> _repository = new();
    private readonly NullLogger<UpdateServiceCommandHandler> _logger = new();

    [Fact]
    public async Task Handle_ExistingService_UpdatesFields()
    {
        var businessId = Guid.NewGuid();
        var service = new Service(businessId, "Old Name", 30, 100.00m);
        var request = new UpdateServiceCommand(businessId, service.Id, new ServiceRequest("New Name", 60, 200.00m));

        _repository.Setup(r => r.GetServiceByIdAsync(businessId, service.Id, It.IsAny<CancellationToken>())).ReturnsAsync(service);
        _repository.Setup(r => r.NameExistsAsync(businessId, "New Name", service.Id, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var handler = new UpdateServiceCommandHandler(_repository.Object, _logger);
        var result = await handler.Handle(request, CancellationToken.None);

        result.Name.Should().Be("New Name");
        result.DurationMinutes.Should().Be(60);
        result.Price.Should().Be(200.00m);
        _repository.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_MissingService_ThrowsKeyNotFound()
    {
        var businessId = Guid.NewGuid();
        var request = new UpdateServiceCommand(businessId, Guid.NewGuid(), new ServiceRequest("Name", 30, 100.00m));

        _repository.Setup(r => r.GetServiceByIdAsync(businessId, request.Id, It.IsAny<CancellationToken>())).ReturnsAsync((Service?)null);

        var handler = new UpdateServiceCommandHandler(_repository.Object, _logger);

        var act = async () => await handler.Handle(request, CancellationToken.None);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }
}

public class DeleteServiceCommandHandlerTests
{
    private readonly Mock<IServiceRepository> _repository = new();
    private readonly NullLogger<DeleteServiceCommandHandler> _logger = new();

    [Fact]
    public async Task Handle_ExistingService_Deletes()
    {
        var businessId = Guid.NewGuid();
        var service = new Service(businessId, "Manicure", 45, 250.00m);

        _repository.Setup(r => r.GetServiceByIdAsync(businessId, service.Id, It.IsAny<CancellationToken>())).ReturnsAsync(service);

        var handler = new DeleteServiceCommandHandler(_repository.Object, _logger);
        await handler.Handle(new DeleteServiceCommand(businessId, service.Id), CancellationToken.None);

        _repository.Verify(r => r.DeleteAsync(service, It.IsAny<CancellationToken>()), Times.Once);
        _repository.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_MissingService_ThrowsKeyNotFound()
    {
        var businessId = Guid.NewGuid();
        _repository.Setup(r => r.GetServiceByIdAsync(businessId, It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Service?)null);

        var handler = new DeleteServiceCommandHandler(_repository.Object, _logger);

        var act = async () => await handler.Handle(new DeleteServiceCommand(businessId, Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }
}

public class CreateServiceCategoryCommandHandlerTests
{
    private readonly Mock<IServiceRepository> _repository = new();
    private readonly NullLogger<CreateServiceCategoryCommandHandler> _logger = new();

    [Fact]
    public async Task Handle_ValidRequest_CreatesCategory()
    {
        var businessId = Guid.NewGuid();
        var request = new CreateServiceCategoryCommand(businessId, new ServiceCategoryRequest("Nails", "Nail services", 1));

        _repository.Setup(r => r.CategoryNameExistsAsync(businessId, "Nails", null, It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var handler = new CreateServiceCategoryCommandHandler(_repository.Object, _logger);
        var result = await handler.Handle(request, CancellationToken.None);

        result.Name.Should().Be("Nails");
        result.Description.Should().Be("Nail services");
        result.DisplayOrder.Should().Be(1);
        _repository.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_DuplicateName_Throws()
    {
        var businessId = Guid.NewGuid();
        var request = new CreateServiceCategoryCommand(businessId, new ServiceCategoryRequest("Nails"));

        _repository.Setup(r => r.CategoryNameExistsAsync(businessId, "Nails", null, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var handler = new CreateServiceCategoryCommandHandler(_repository.Object, _logger);

        var act = async () => await handler.Handle(request, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}

public class DeleteServiceCategoryCommandHandlerTests
{
    private readonly Mock<IServiceRepository> _repository = new();
    private readonly NullLogger<DeleteServiceCategoryCommandHandler> _logger = new();

    [Fact]
    public async Task Handle_ExistingCategory_Deletes()
    {
        var businessId = Guid.NewGuid();
        var category = new ServiceCategory(businessId, "Nails", null, 0);

        _repository.Setup(r => r.GetCategoryByIdAsync(businessId, category.Id, It.IsAny<CancellationToken>())).ReturnsAsync(category);

        var handler = new DeleteServiceCategoryCommandHandler(_repository.Object, _logger);
        await handler.Handle(new DeleteServiceCategoryCommand(businessId, category.Id), CancellationToken.None);

        _repository.Verify(r => r.DeleteAsync(category, It.IsAny<CancellationToken>()), Times.Once);
        _repository.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}