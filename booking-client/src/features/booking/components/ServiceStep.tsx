import type { Service } from '../../services/types';

interface ServiceStepProps {
  services: Service[];
  selectedId?: string;
  onSelect: (service: Service) => void;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(price);
}

export function ServiceStep({ services, selectedId, onSelect }: ServiceStepProps) {
  if (services.length === 0) {
    return (
      <div className="ticket-plain text-center">
        <p className="text-ink-soft">No services available right now. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {services.map((service) => (
        <button
          key={service.id}
          type="button"
          onClick={() => onSelect(service)}
          className={`ticket-plain text-left w-full transition-colors ${
            selectedId === service.id ? 'border-brass ring-2 ring-brass ring-offset-2 ring-offset-paper' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-ink">{service.name}</h3>
              {service.description && <p className="mt-1 text-sm text-slate">{service.description}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-sm font-medium text-brass">{formatPrice(service.price)}</p>
              <p className="mt-1 font-mono text-xs text-slate">{service.durationMinutes} min</p>
            </div>
          </div>
          {service.categoryName && (
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-slate">{service.categoryName}</p>
          )}
        </button>
      ))}
    </div>
  );
}
