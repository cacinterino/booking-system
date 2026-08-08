using MediatR;
using Booking.Application.Services.DTOs;

namespace Booking.Application.Services.Commands;

public record CreateServiceCommand(
    Guid BusinessId,
    ServiceRequest Request
) : IRequest<ServiceResponse>;

public record UpdateServiceCommand(
    Guid BusinessId,
    Guid Id,
    ServiceRequest Request
) : IRequest<ServiceResponse>;

public record DeleteServiceCommand(
    Guid BusinessId,
    Guid Id
) : IRequest<Unit>;

public record CreateServiceCategoryCommand(
    Guid BusinessId,
    ServiceCategoryRequest Request
) : IRequest<ServiceCategoryResponse>;

public record UpdateServiceCategoryCommand(
    Guid BusinessId,
    Guid Id,
    ServiceCategoryRequest Request
) : IRequest<ServiceCategoryResponse>;

public record DeleteServiceCategoryCommand(
    Guid BusinessId,
    Guid Id
) : IRequest<Unit>;