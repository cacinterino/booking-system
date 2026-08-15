import { useMemo, useState } from 'react';
import { usePublicAvailability } from '../hooks';
import type { AvailableSlot } from '../types';

interface DateTimeStepProps {
  slug: string;
  serviceId: string;
  serviceName: string;
  staffId?: string;
  advanceBookingDays: number;
  selectedSlot?: AvailableSlot;
  onSelectSlot: (slot: AvailableSlot) => void;
}

function formatTime(localIso: string): string {
  const date = new Date(localIso);
  return date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatDateLabel(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
}

function toLocalDateKey(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function DateTimeStep({
  slug,
  serviceId,
  serviceName,
  staffId,
  advanceBookingDays,
  selectedSlot,
  onSelectSlot,
}: DateTimeStepProps) {
  const [selectedDate, setSelectedDate] = useState<string>(() => toLocalDateKey(new Date()));

  const dates = useMemo(() => {
    const list: string[] = [];
    const base = new Date();
    for (let i = 0; i <= advanceBookingDays; i++) {
      list.push(toLocalDateKey(new Date(base.getFullYear(), base.getMonth(), base.getDate() + i)));
    }
    return list;
  }, [advanceBookingDays]);

  const { data, isLoading, isFetching, isError } = usePublicAvailability(
    slug,
    serviceId,
    selectedDate,
    staffId,
    true,
  );

  const grouped = useMemo(() => {
    if (!data) return new Map<string, AvailableSlot[]>();
    const map = new Map<string, AvailableSlot[]>();
    for (const slot of data.slots) {
      const list = map.get(slot.staffName) ?? [];
      list.push(slot);
      map.set(slot.staffName, list);
    }
    return map;
  }, [data]);

  const handleSlot = (slot: AvailableSlot) => {
    onSelectSlot(slot);
  };

  const isLoadingSlots = (isLoading || isFetching) && !data;

  return (
    <div className="space-y-6">
      <div>
        <label className="label-field">Choose a date</label>
        <div className="flex flex-wrap gap-2">
          {dates.map((date) => (
            <button
              key={date}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                date === selectedDate
                  ? 'border-brass bg-brass text-paper-white'
                  : 'border-line bg-paper-white text-ink hover:bg-ink/5'
              }`}
            >
              {formatDateLabel(date)}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-32">
        {isLoadingSlots ? (
          <p className="text-slate">Loading available times…</p>
        ) : isError ? (
          <p className="text-red-600">Could not load availability. Please refresh.</p>
        ) : data && data.slots.length === 0 ? (
          <div className="ticket-plain text-center">
            <p className="text-ink-soft">This date is fully booked.</p>
            <p className="mt-1 text-sm text-slate">Try another date above.</p>
          </div>
        ) : (
          <>
            {data && (
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-slate">
                {serviceName} · {data.slots.length} open slot{data.slots.length === 1 ? '' : 's'}
              </p>
            )}
            <div className="space-y-4">
              {Array.from(grouped.entries()).map(([staffName, slots]) => (
                <div key={staffName}>
                  <p className="mb-2 font-display font-semibold text-ink">{staffName}</p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <button
                        key={`${slot.staffId}-${slot.startUtc}`}
                        type="button"
                        onClick={() => handleSlot(slot)}
                        className={`px-4 py-2 rounded-lg font-mono text-sm border transition-colors ${
                          selectedSlot?.startUtc === slot.startUtc && selectedSlot?.staffId === slot.staffId
                            ? 'border-brass bg-brass text-paper-white'
                            : 'border-line bg-paper-white text-ink hover:border-brass hover:text-brass'
                        }`}
                      >
                        {formatTime(slot.start)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
