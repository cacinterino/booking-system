using System.Text.Json.Serialization;

namespace Booking.Domain;

public class Business : Entity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? Address { get; private set; }
    public string? Phone { get; private set; }
    public string? Email { get; private set; }
    public string Timezone { get; private set; } = "Asia/Manila";
    public BusinessSettings Settings { get; private set; } = new();

    private readonly List<ServiceCategory> _serviceCategories = new();
    private readonly List<Service> _services = new();
    private readonly List<Staff> _staff = new();
    private readonly List<Customer> _customers = new();
    private readonly List<Booking> _bookings = new();
    private readonly List<Notification> _notifications = new();

    public IReadOnlyCollection<ServiceCategory> ServiceCategories => _serviceCategories.AsReadOnly();
    public IReadOnlyCollection<Service> Services => _services.AsReadOnly();
    public IReadOnlyCollection<Staff> Staff => _staff.AsReadOnly();
    public IReadOnlyCollection<Customer> Customers => _customers.AsReadOnly();
    public IReadOnlyCollection<Booking> Bookings => _bookings.AsReadOnly();
    public IReadOnlyCollection<Notification> Notifications => _notifications.AsReadOnly();

    private Business() { }

    public Business(string name, string slug, string? description = null, string? address = null, string? phone = null, string? email = null)
    {
        Name = name;
        Slug = slug.ToLowerInvariant();
        Description = description;
        Address = address;
        Phone = phone;
        Email = email;
    }

    public void UpdateDetails(string name, string? description, string? address, string? phone, string? email)
    {
        Name = name;
        Description = description;
        Address = address;
        Phone = phone;
        Email = email;
        MarkUpdated();
    }

    public void UpdateSettings(BusinessSettings settings)
    {
        Settings = settings;
        MarkUpdated();
    }
}

public class BusinessSettings
{
    public int SlotIntervalMinutes { get; set; } = 15;
    public int AdvanceBookingDays { get; set; } = 30;
    public int CancellationWindowHours { get; set; } = 24;
    public bool RequireDeposit { get; set; } = true;
    public decimal DepositAmount { get; set; } = 100;
    public string Currency { get; set; } = "PHP";
    public Dictionary<string, object> CustomFields { get; set; } = new();
}