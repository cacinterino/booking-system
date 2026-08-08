using Booking.Application.Bookings.DTOs;
using Booking.Application.Bookings.Interfaces;
using Booking.Application.Bookings.Queries;
using MediatR;

namespace Booking.Application.Bookings.Handlers;

internal static class ManilaBoundary
{
    internal static readonly TimeSpan OffsetFromUtc = TimeSpan.FromHours(8);

    public static DateTime ToUtc(DateTime manila)
    {
        manila = DateTime.SpecifyKind(manila, DateTimeKind.Unspecified);
        return DateTime.SpecifyKind(manila.Subtract(OffsetFromUtc), DateTimeKind.Utc);
    }

    public static (DateTime FromUtc, DateTime ToUtc) RangeUtc(DateOnly from, DateOnly to)
    {
        // Guard against DateOnly.MinValue sentinels overflowing DateTime on -8h.
        if (from.Year <= 1) from = DateOnly.FromDateTime(DateTime.UnixEpoch);
        if (to.Year > 9990) to = new DateOnly(9999, 12, 30);
        var fromUtc = ToUtc(from.ToDateTime(TimeOnly.MinValue));
        var toUtc = ToUtc(to.AddDays(1).ToDateTime(TimeOnly.MinValue));
        return (fromUtc, toUtc);
    }
}

public class MyBookingsQueryHandler : IRequestHandler<MyBookingsQuery, IReadOnlyList<BookingResponse>>
{
    private readonly IBookingRepository _bookingRepo;

    public MyBookingsQueryHandler(IBookingRepository bookingRepo)
    {
        _bookingRepo = bookingRepo;
    }

    public async Task<IReadOnlyList<BookingResponse>> Handle(MyBookingsQuery query, CancellationToken cancellationToken)
    {
        var customerId = await ResolveCustomerIdAsync(query, cancellationToken);

        var bookings = await _bookingRepo.GetByCustomerAsync(customerId, query.UpcomingOnly, cancellationToken);

        return bookings.Select(BookingDtoMapper.ToResponse).ToList();
    }

    private async Task<Guid> ResolveCustomerIdAsync(MyBookingsQuery query, CancellationToken cancellationToken)
    {
        if (query.AuthenticatedUserId.HasValue)
        {
            var owner = await _bookingRepo.GetCustomerByUserIdAsync(query.AuthenticatedUserId.Value, cancellationToken);
            if (owner is null)
                throw new UnauthorizedAccessException("You are not a registered customer");
            return owner.Id;
        }

        if (!string.IsNullOrEmpty(query.AccessCode))
        {
            var guest = await _bookingRepo.GetCustomerByAccessCodeAsync(query.AccessCode, cancellationToken);
            if (guest is null)
                throw new UnauthorizedAccessException("Invalid access code");
            return guest.Id;
        }

        throw new UnauthorizedAccessException("A customer or access code is required");
    }
}

public class ListBookingsQueryHandler : IRequestHandler<ListBookingsQuery, BookingListResponse>
{
    private readonly IBookingRepository _bookingRepo;

    public ListBookingsQueryHandler(IBookingRepository bookingRepo)
    {
        _bookingRepo = bookingRepo;
    }

    public async Task<BookingListResponse> Handle(ListBookingsQuery query, CancellationToken cancellationToken)
    {
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);

        var items = await _bookingRepo.GetByBusinessAsync(
            query.BusinessId,
            query.Status,
            query.StaffId,
            query.FromDate,
            query.ToDate,
            page,
            pageSize,
            cancellationToken);

        var total = await _bookingRepo.CountByBusinessAsync(
            query.BusinessId,
            query.Status,
            query.StaffId,
            query.FromDate,
            query.ToDate,
            cancellationToken);

        return new BookingListResponse(
            items.Select(BookingDtoMapper.ToResponse).ToList(),
            total,
            page,
            pageSize);
    }
}

public class GetCalendarQueryHandler : IRequestHandler<GetCalendarQuery, IReadOnlyList<CalendarEventDto>>
{
    private readonly IBookingRepository _bookingRepo;

    public GetCalendarQueryHandler(IBookingRepository bookingRepo)
    {
        _bookingRepo = bookingRepo;
    }

    public async Task<IReadOnlyList<CalendarEventDto>> Handle(GetCalendarQuery query, CancellationToken cancellationToken)
    {
        Guid? staffId = query.StaffId;

        // A staff member (non-admin) may only see their own calendar.
        if (!query.IsAdmin)
        {
            var staff = await _bookingRepo.GetStaffByBusinessAndUserIdAsync(query.BusinessId, query.AuthenticatedUserId, cancellationToken)
                ?? throw new UnauthorizedAccessException("Only staff of this business may view the calendar");

            if (query.StaffId.HasValue && query.StaffId.Value != staff.Id)
                throw new UnauthorizedAccessException("Staff may not view other staff calendars");

            staffId = staff.Id;
        }

        var (fromUtc, toUtc) = ManilaBoundary.RangeUtc(query.From, query.To);

        var bookings = await _bookingRepo.GetCalendarAsync(
            query.BusinessId,
            staffId,
            fromUtc,
            toUtc,
            cancellationToken);

        return bookings.Select(b => new CalendarEventDto(
            b.Id,
            $"{b.Customer?.FullName ?? "Guest"} - {b.Service?.Name ?? "Service"}",
            BookingDtoMapper.ToManila(b.StartTime),
            BookingDtoMapper.ToManila(b.EndTime),
            b.Status,
            b.StaffId,
            b.Customer?.FullName ?? string.Empty)).ToList();
    }
}