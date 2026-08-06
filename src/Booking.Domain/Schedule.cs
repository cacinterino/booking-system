namespace Booking.Domain;

public class StaffSchedule : Entity
{
    public Guid StaffId { get; private set; }
    public Staff? Staff { get; private set; }
    public DayOfWeek DayOfWeek { get; private set; }
    public TimeSpan StartTime { get; private set; }
    public TimeSpan EndTime { get; private set; }
    public bool IsWorking { get; private set; } = true;

    private StaffSchedule() { }

    public StaffSchedule(Guid staffId, DayOfWeek dayOfWeek, TimeSpan startTime, TimeSpan endTime, bool isWorking = true)
    {
        StaffId = staffId;
        DayOfWeek = dayOfWeek;
        StartTime = startTime;
        EndTime = endTime;
        IsWorking = isWorking;
    }

    public void Update(DayOfWeek dayOfWeek, TimeSpan startTime, TimeSpan endTime, bool isWorking)
    {
        DayOfWeek = dayOfWeek;
        StartTime = startTime;
        EndTime = endTime;
        IsWorking = isWorking;
        MarkUpdated();
    }
}

public class ScheduleOverride : Entity
{
    public Guid StaffId { get; private set; }
    public Staff? Staff { get; private set; }
    public DateOnly Date { get; private set; }
    public TimeSpan? StartTime { get; private set; }
    public TimeSpan? EndTime { get; private set; }
    public bool IsTimeOff { get; private set; }
    public string? Reason { get; private set; }

    private ScheduleOverride() { }

    public ScheduleOverride(Guid staffId, DateOnly date, bool isTimeOff, string? reason = null)
    {
        StaffId = staffId;
        Date = date;
        IsTimeOff = isTimeOff;
        Reason = reason;
    }

    public ScheduleOverride(Guid staffId, DateOnly date, TimeSpan startTime, TimeSpan endTime, string? reason = null)
    {
        StaffId = staffId;
        Date = date;
        StartTime = startTime;
        EndTime = endTime;
        IsTimeOff = false;
        Reason = reason;
    }

    public void Update(DateOnly date, TimeSpan? startTime, TimeSpan? endTime, bool isTimeOff, string? reason)
    {
        Date = date;
        StartTime = startTime;
        EndTime = endTime;
        IsTimeOff = isTimeOff;
        Reason = reason;
        MarkUpdated();
    }
}