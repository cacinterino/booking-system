using MediatR;
using Booking.Application.Services.DTOs;
using Booking.Application.Services.Interfaces;
using Booking.Application.Services.Queries;

namespace Booking.Application.Services.Handlers;

public class GetServicesQueryHandler : IRequestHandler<GetServicesQuery, IReadOnlyList<ServiceResponse>>
{
    private readonly IServiceRepository _repository;

    public GetServicesQueryHandler(IServiceRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<ServiceResponse>> Handle(GetServicesQuery request, CancellationToken cancellationToken)
    {
        var services = await _repository.GetServicesAsync(request.BusinessId, request.IncludeInactive, cancellationToken);

        return services.Select(s => new ServiceResponse(
            s.Id,
            s.Name,
            s.Description,
            s.DurationMinutes,
            s.Price,
            s.CategoryId,
            s.Category?.Name,
            s.BusinessId,
            s.IsActive,
            s.DisplayOrder,
            s.Color)).ToList();
    }
}

public class GetServiceQueryHandler : IRequestHandler<GetServiceQuery, ServiceResponse>
{
    private readonly IServiceRepository _repository;

    public GetServiceQueryHandler(IServiceRepository repository)
    {
        _repository = repository;
    }

    public async Task<ServiceResponse> Handle(GetServiceQuery request, CancellationToken cancellationToken)
    {
        var service = await _repository.GetServiceByIdAsync(request.BusinessId, request.Id, cancellationToken);
        if (service == null)
            throw new KeyNotFoundException("Service not found");

        return new ServiceResponse(
            service.Id,
            service.Name,
            service.Description,
            service.DurationMinutes,
            service.Price,
            service.CategoryId,
            service.Category?.Name,
            service.BusinessId,
            service.IsActive,
            service.DisplayOrder,
            service.Color);
    }
}

public class GetServiceCategoriesQueryHandler : IRequestHandler<GetServiceCategoriesQuery, IReadOnlyList<ServiceCategoryResponse>>
{
    private readonly IServiceRepository _repository;

    public GetServiceCategoriesQueryHandler(IServiceRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<ServiceCategoryResponse>> Handle(GetServiceCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _repository.GetCategoriesAsync(request.BusinessId, cancellationToken);
        var responses = new List<ServiceCategoryResponse>();

        foreach (var category in categories)
        {
            var count = await _repository.GetServiceCountForCategoryAsync(category.Id, cancellationToken);
            responses.Add(new ServiceCategoryResponse(category.Id, category.Name, category.Description, category.DisplayOrder, count));
        }

        return responses;
    }
}