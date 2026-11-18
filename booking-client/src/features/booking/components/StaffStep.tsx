import type { PublicStaff } from '../types';
import { Card } from '../../../shared/ui';

interface StaffStepProps {
  staff: PublicStaff[];
  selectedId?: string;
  onSelect: (staff: PublicStaff) => void;
}

export function StaffStep({ staff, selectedId, onSelect }: StaffStepProps) {
  if (staff.length === 0) {
    return (
      <Card className="text-center">
        <p className="text-ink-soft">No staff available for this service. Please pick another service.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {staff.map((member) => (
        <Card
          key={member.id}
          className={`text-left w-full transition-colors cursor-pointer ${
            selectedId === member.id ? 'border-brass ring-2 ring-brass ring-offset-2 ring-offset-paper' : ''
          }`}
          onClick={() => onSelect(member)}
        >
          <h2 className="font-display text-lg font-semibold text-ink">{member.fullName}</h2>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-slate">Available for this service</p>
        </Card>
      ))}
    </div>
  );
}
