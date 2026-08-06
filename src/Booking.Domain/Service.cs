namespace Booking.Domain;

public class ServiceCategory : Entity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public int DisplayOrder { get; private set; }
    public Guid BusinessId { get; private set; }
    public Business? Business { get; private set; }
    public ICollection<Service> Services { get; private set; } = new List<Service>();

    private ServiceCategory() { }

    public ServiceCategory(Guid businessId, string name, string? description = null, int displayOrder = 0)
    {
        BusinessId = businessId;
        Name = name;
        Description = description;
        DisplayOrder = displayOrder;
    }

    public void Update(string name, string? description, int displayOrder)
    {
        Name = name;
        Description = description;
        DisplayOrder = displayOrder;
        MarkUpdated();
    }
}

public class Service : Entity
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public int DurationMinutes { get; private set; }
    public decimal Price { get; private set; }
    public Guid BusinessId { get; private set; }
    public Business? Business { get; private set; }
    public Guid? CategoryId { get; private set; }
    public ServiceCategory? Category { get; private set; }
    public ICollection<StaffService> StaffServices { get; private set; } = new List<StaffService>();
    public bool IsActive { get; private set; } = true;
    public int DisplayOrder { get; private set; }
    public string? Color { get; private set; }

    private Service() { }

    public Service(Guid businessId, string name, int durationMinutes, decimal price, Guid? categoryId = null, string? description = null, int displayOrder = 0, string? color = null)
    {
        BusinessId = businessId;
        Name = name;
        DurationMinutes = durationMinutes;
        Price = price;
        CategoryId = categoryId;
        Description = description;
        DisplayOrder = displayOrder;
        Color = color;
    }

    public void Update(string name, int durationMinutes, decimal price, Guid? categoryId, string? description, bool isActive, int displayOrder, string? color)
    {
        Name = name;
        DurationMinutes = durationMinutes;
        Price = price;
        CategoryId = categoryId;
        Description = description;
        IsActive = isActive;
        DisplayOrder = displayOrder;
        Color = color;
        MarkUpdated();
    }
}