namespace Booking.Application.Services.DTOs;

public record ServiceCategoryRequest(
    string Name,
    string? Description = null,
    int DisplayOrder = 0
);

public record ServiceCategoryResponse(
    Guid Id,
    string Name,
    string? Description,
    int DisplayOrder,
    int ServiceCount
);

public record ServiceRequest(
    string Name,
    int DurationMinutes,
    decimal Price,
    Guid? CategoryId = null,
    string? Description = null,
    bool IsActive = true,
    int DisplayOrder = 0,
    string? Color = null
);

public record ServiceResponse(
    Guid Id,
    string Name,
    string? Description,
    int DurationMinutes,
    decimal Price,
    Guid? CategoryId,
    string? CategoryName,
    Guid BusinessId,
    bool IsActive,
    int DisplayOrder,
    string? Color
);
