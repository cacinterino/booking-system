namespace Booking.Domain;

public class Customer : Entity
{
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public Guid BusinessId { get; private set; }
    public Business? Business { get; private set; }
    public Guid? UserId { get; private set; }
    public string? Notes { get; private set; }
    public ICollection<Booking> Bookings { get; private set; } = new List<Booking>();

    private Customer() { }

    public Customer(Guid businessId, string firstName, string lastName, string email, string? phone = null, Guid? userId = null)
    {
        BusinessId = businessId;
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        Phone = phone;
        UserId = userId;
    }

    public string FullName => $"{FirstName} {LastName}";

    public void Update(string firstName, string lastName, string email, string? phone, string? notes)
    {
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        Phone = phone;
        Notes = notes;
        MarkUpdated();
    }

    public void AssignUser(Guid userId)
    {
        UserId = userId;
        MarkUpdated();
    }
}