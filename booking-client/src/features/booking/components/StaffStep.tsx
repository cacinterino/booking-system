import type { PublicStaff } from '../types';

interface StaffStepProps {
  staff: PublicStaff[];
  selectedId?: string;
  onSelect: (staff: PublicStaff) => void;
}

export function StaffStep({ staff, selectedId, onSelect }: StaffStepProps) {
  if (staff.length === 0) {
    return (
      <div className="ticket-plain text-center">
        <p className="text-ink-soft">No staff available for this service. Please pick another service.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {staff.map((member) => (
        <button
          key={member.id}
          type="button"
          onClick={() => onSelect(member)}
          className={`ticket-plain text-left w-full transition-colors ${
            selectedId === member.id ? 'border-brass ring-2 ring-brass ring-offset-2 ring-offset-paper' : ''
          }`}
        >
          <h3 className="font-display text-lg font-semibold text-ink">{member.fullName}</h3>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate">Available for this service</p>
        </button>
      ))}
    </div>
  );
}
