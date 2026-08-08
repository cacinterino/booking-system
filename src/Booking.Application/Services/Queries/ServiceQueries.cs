using MediatR;
using Booking.Application.Services.DTOs;

namespace Booking.Application.Services.Queries;

public record GetServicesQuery(
    Guid BusinessId,
    bool IncludeInactive = false
) : IRequest<IReadOnlyList<ServiceResponse>>;

public record GetServiceQuery(
    Guid BusinessId,
    Guid Id
) : IRequest<ServiceResponse>;

public record GetServiceCategoriesQuery(
    Guid BusinessId
) : IRequest<IReadOnlyList<ServiceCategoryResponse>>;