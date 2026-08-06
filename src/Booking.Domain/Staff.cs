namespace Booking.Domain;

public class Staff : Entity
{
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string? Email { get; private set; }
    public string? Phone { get; private set; }
    public string? AvatarUrl { get; private set; }
    public Guid BusinessId { get; private set; }
    public Business? Business { get; private set; }
    public bool IsActive { get; private set; } = true;
    public int DisplayOrder { get; private set; }
    public Guid? UserId { get; private set; }

    private readonly List<StaffService> _services = new();
    private readonly List<StaffSchedule> _schedules = new();
    private readonly List<ScheduleOverride> _overrides = new();
    private readonly List<Booking> _bookings = new();

    public IReadOnlyCollection<StaffService> Services => _services.AsReadOnly();
    public IReadOnlyCollection<StaffSchedule> Schedules => _schedules.AsReadOnly();
    public IReadOnlyCollection<ScheduleOverride> Overrides => _overrides.AsReadOnly();
    public IReadOnlyCollection<Booking> Bookings => _bookings.AsReadOnly();

    private Staff() { }

    public Staff(Guid businessId, string firstName, string lastName, string? email = null, string? phone = null, Guid? userId = null)
    {
        BusinessId = businessId;
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        Phone = phone;
        UserId = userId;
    }

    public string FullName => $"{FirstName} {LastName}";

    public void Update(string firstName, string lastName, string? email, string? phone, bool isActive, int displayOrder)
    {
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        Phone = phone;
        IsActive = isActive;
        DisplayOrder = displayOrder;
        MarkUpdated();
    }

    public void AssignUser(Guid userId)
    {
        UserId = userId;
        MarkUpdated();
    }

    public void AddService(Guid serviceId)
    {
        if (!_services.Any(s => s.ServiceId == serviceId))
        {
            _services.Add(new StaffService(Id, serviceId));
            MarkUpdated();
        }
    }

    public void RemoveService(Guid serviceId)
    {
        var service = _services.FirstOrDefault(s => s.ServiceId == serviceId);
        if (service != null)
        {
            _services.Remove(service);
            MarkUpdated();
        }
    }
}

public class StaffService : Entity
{
    public Guid StaffId { get; private set; }
    public Staff? Staff { get; private set; }
    public Guid ServiceId { get; private set; }
    public Service? Service { get; private set; }

    private StaffService() { }

    public StaffService(Guid staffId, Guid serviceId)
    {
        StaffId = staffId;
        ServiceId = serviceId;
    }
}