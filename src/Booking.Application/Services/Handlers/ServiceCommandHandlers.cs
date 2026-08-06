using MediatR;
using Microsoft.Extensions.Logging;
using Booking.Application.Services.Commands;
using Booking.Application.Services.DTOs;
using Booking.Application.Services.Interfaces;
using Booking.Domain;

namespace Booking.Application.Services.Handlers;

public class CreateServiceCommandHandler : IRequestHandler<CreateServiceCommand, ServiceResponse>
{
    private readonly IServiceRepository _repository;
    private readonly ILogger<CreateServiceCommandHandler> _logger;

    public CreateServiceCommandHandler(IServiceRepository repository, ILogger<CreateServiceCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<ServiceResponse> Handle(CreateServiceCommand request, CancellationToken cancellationToken)
    {
        var req = request.Request;

        if (await _repository.NameExistsAsync(request.BusinessId, req.Name, null, cancellationToken))
            throw new InvalidOperationException("A service with this name already exists");

        var service = new Service(
            request.BusinessId,
            req.Name,
            req.DurationMinutes,
            req.Price,
            req.CategoryId,
            req.Description,
            req.DisplayOrder,
            req.Color);

        await _repository.AddServiceAsync(service, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Service created: {Name} for business {BusinessId}", service.Name, request.BusinessId);

        string? categoryName = null;
        if (service.CategoryId.HasValue)
        {
            var category = await _repository.GetCategoryByIdAsync(request.BusinessId, service.CategoryId.Value, cancellationToken);
            categoryName = category?.Name;
        }

        return new ServiceResponse(
            service.Id,
            service.Name,
            service.Description,
            service.DurationMinutes,
            service.Price,
            service.CategoryId,
            categoryName,
            request.BusinessId,
            service.IsActive,
            service.DisplayOrder,
            service.Color);
    }
}

public class UpdateServiceCommandHandler : IRequestHandler<UpdateServiceCommand, ServiceResponse>
{
    private readonly IServiceRepository _repository;
    private readonly ILogger<UpdateServiceCommandHandler> _logger;

    public UpdateServiceCommandHandler(IServiceRepository repository, ILogger<UpdateServiceCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<ServiceResponse> Handle(UpdateServiceCommand request, CancellationToken cancellationToken)
    {
        var service = await _repository.GetServiceByIdAsync(request.BusinessId, request.Id, cancellationToken);
        if (service == null)
            throw new KeyNotFoundException("Service not found");

        var req = request.Request;

        if (await _repository.NameExistsAsync(request.BusinessId, req.Name, service.Id, cancellationToken))
            throw new InvalidOperationException("A service with this name already exists");

        service.Update(
            req.Name,
            req.DurationMinutes,
            req.Price,
            req.CategoryId,
            req.Description,
            req.IsActive,
            req.DisplayOrder,
            req.Color);

        await _repository.UpdateAsync(service, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Service updated: {ServiceId}", service.Id);

        return new ServiceResponse(
            service.Id,
            service.Name,
            service.Description,
            service.DurationMinutes,
            service.Price,
            service.CategoryId,
            service.Category?.Name,
            request.BusinessId,
            service.IsActive,
            service.DisplayOrder,
            service.Color);
    }
}

public class DeleteServiceCommandHandler : IRequestHandler<DeleteServiceCommand, Unit>
{
    private readonly IServiceRepository _repository;
    private readonly ILogger<DeleteServiceCommandHandler> _logger;

    public DeleteServiceCommandHandler(IServiceRepository repository, ILogger<DeleteServiceCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Unit> Handle(DeleteServiceCommand request, CancellationToken cancellationToken)
    {
        var service = await _repository.GetServiceByIdAsync(request.BusinessId, request.Id, cancellationToken);
        if (service == null)
            throw new KeyNotFoundException("Service not found");

        await _repository.DeleteAsync(service, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Service deleted: {ServiceId}", service.Id);
        return Unit.Value;
    }
}

public class CreateServiceCategoryCommandHandler : IRequestHandler<CreateServiceCategoryCommand, ServiceCategoryResponse>
{
    private readonly IServiceRepository _repository;
    private readonly ILogger<CreateServiceCategoryCommandHandler> _logger;

    public CreateServiceCategoryCommandHandler(IServiceRepository repository, ILogger<CreateServiceCategoryCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<ServiceCategoryResponse> Handle(CreateServiceCategoryCommand request, CancellationToken cancellationToken)
    {
        var req = request.Request;

        if (await _repository.CategoryNameExistsAsync(request.BusinessId, req.Name, null, cancellationToken))
            throw new InvalidOperationException("A category with this name already exists");

        var category = new ServiceCategory(request.BusinessId, req.Name, req.Description, req.DisplayOrder);

        await _repository.AddAsync(category, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Service category created: {CategoryId}", category.Id);

        return new ServiceCategoryResponse(category.Id, category.Name, category.Description, category.DisplayOrder, 0);
    }
}

public class UpdateServiceCategoryCommandHandler : IRequestHandler<UpdateServiceCategoryCommand, ServiceCategoryResponse>
{
    private readonly IServiceRepository _repository;
    private readonly ILogger<UpdateServiceCategoryCommandHandler> _logger;

    public UpdateServiceCategoryCommandHandler(IServiceRepository repository, ILogger<UpdateServiceCategoryCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<ServiceCategoryResponse> Handle(UpdateServiceCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _repository.GetCategoryByIdAsync(request.BusinessId, request.Id, cancellationToken);
        if (category == null)
            throw new KeyNotFoundException("Category not found");

        var req = request.Request;

        if (await _repository.CategoryNameExistsAsync(request.BusinessId, req.Name, category.Id, cancellationToken))
            throw new InvalidOperationException("A category with this name already exists");

        category.Update(req.Name, req.Description, req.DisplayOrder);

        await _repository.UpdateAsync(category, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Service category updated: {CategoryId}", category.Id);
        return await ToResponseAsync(category, cancellationToken);
    }

    private async Task<ServiceCategoryResponse> ToResponseAsync(ServiceCategory category, CancellationToken cancellationToken)
    {
        var count = await _repository.GetServiceCountForCategoryAsync(category.Id, cancellationToken);
        return new ServiceCategoryResponse(category.Id, category.Name, category.Description, category.DisplayOrder, count);
    }
}

public class DeleteServiceCategoryCommandHandler : IRequestHandler<DeleteServiceCategoryCommand, Unit>
{
    private readonly IServiceRepository _repository;
    private readonly ILogger<DeleteServiceCategoryCommandHandler> _logger;

    public DeleteServiceCategoryCommandHandler(IServiceRepository repository, ILogger<DeleteServiceCategoryCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Unit> Handle(DeleteServiceCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _repository.GetCategoryByIdAsync(request.BusinessId, request.Id, cancellationToken);
        if (category == null)
            throw new KeyNotFoundException("Category not found");

        await _repository.DeleteAsync(category, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Service category deleted: {CategoryId}", category.Id);
        return Unit.Value;
    }
}