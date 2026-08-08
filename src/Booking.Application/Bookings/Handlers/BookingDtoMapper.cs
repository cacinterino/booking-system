using System.Security.Cryptography;
using Booking.Application.Bookings.DTOs;
using BookingEntity = Booking.Domain.Booking;

namespace Booking.Application.Bookings.Handlers;

internal static class BookingDtoMapper
{
    private static readonly TimeSpan ManilaOffsetFromUtc = TimeSpan.FromHours(8);

    public static BookingResponse ToResponse(BookingEntity booking)
    {
        return new BookingResponse(
            booking.Id,
            booking.BusinessId,
            booking.ServiceId,
            booking.Service?.Name ?? string.Empty,
            booking.StaffId,
            booking.Staff?.FullName ?? string.Empty,
            booking.CustomerId,
            booking.Customer?.FullName ?? string.Empty,
            ToManila(booking.StartTime),
            ToManila(booking.EndTime),
            booking.Status,
            booking.TotalAmount,
            booking.Notes,
            booking.AccessCode);
    }

    public static string ToManila(DateTime utc)
    {
        if (utc.Kind == DateTimeKind.Local)
            utc = utc.ToUniversalTime();
        if (utc.Kind == DateTimeKind.Unspecified)
            utc = DateTime.SpecifyKind(utc, DateTimeKind.Utc);
        return (utc + ManilaOffsetFromUtc).ToString("yyyy-MM-ddTHH:mm:ss");
    }

    public static string GenerateAccessCode()
    {
        const string alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var bytes = new byte[8];
        RandomNumberGenerator.Fill(bytes);
        var chars = new char[8];
        for (var i = 0; i < chars.Length; i++)
            chars[i] = alphabet[bytes[i] % alphabet.Length];
        return new string(chars);
    }
}