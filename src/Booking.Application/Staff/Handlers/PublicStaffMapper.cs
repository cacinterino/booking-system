using Booking.Application.Staff.DTOs;

namespace Booking.Application.Staff.Handlers;

public static class PublicStaffMapper
{
    public static PublicStaffResponse ToPublic(StaffResponse staff) =>
        new(staff.Id, staff.FullName, staff.DisplayOrder, staff.ServiceIds);
}
