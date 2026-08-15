import { useState } from 'react';
import { useCreateStaff, useUpdateStaff } from './adminHooks';
import type { Service } from '../services/types';
import type { StaffResponse } from './types';
import { extractApiDetail } from '../booking/errors';

interface StaffFormModalProps {
  staff?: StaffResponse;
  services: Service[];
  onClose: () => void;
}

export function StaffFormModal({ staff, services, onClose }: StaffFormModalProps) {
  const isEdit = !!staff;
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const busy = createMutation.isPending || updateMutation.isPending;

  const [firstName, setFirstName] = useState(staff?.firstName ?? '');
  const [lastName, setLastName] = useState(staff?.lastName ?? '');
  const [email, setEmail] = useState(staff?.email ?? '');
  const [phone, setPhone] = useState(staff?.phone ?? '');
  const [displayOrder, setDisplayOrder] = useState(staff?.displayOrder ?? 0);
  const [isActive, setIsActive] = useState(staff?.isActive ?? true);
  const [serviceIds, setServiceIds] = useState<string[]>(staff?.serviceIds ?? []);
  const [error, setError] = useState<string | null>(null);

  const toggleService = (id: string) => {
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      isActive,
      displayOrder,
      serviceIds,
      avatarUrl: staff?.avatarUrl ?? null,
    };
    if (!payload.firstName || !payload.lastName) {
      setError('First and last name are required.');
      return;
    }
    try {
      if (isEdit && staff) {
        await updateMutation.mutateAsync({ id: staff.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      setError(extractApiDetail(err) ?? 'Could not save staff. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" role="dialog" aria-modal="true" aria-label={isEdit ? `Edit ${staff?.fullName}` : 'Add staff'}>
      <form onSubmit={handleSubmit} className="w-full max-w-lg card shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-brass">{isEdit ? 'Edit' : 'New team member'}</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
            {isEdit ? staff?.fullName : 'Add staff'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-field" htmlFor="sf-first">First name</label>
            <input id="sf-first" className="input-field" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="label-field" htmlFor="sf-last">Last name</label>
            <input id="sf-last" className="input-field" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-field" htmlFor="sf-email">Email</label>
            <input id="sf-email" type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@business.com" />
          </div>
          <div>
            <label className="label-field" htmlFor="sf-phone">Phone</label>
            <input id="sf-phone" type="tel" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0917 000 0000" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="label-field" htmlFor="sf-order">Display order</label>
            <input id="sf-order" type="number" min={0} className="input-field" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} />
          </div>
          <div>
            <label className="label-field">Status</label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-line text-brass focus:ring-brass" />
              Active
            </label>
          </div>
        </div>

        <div className="mt-4">
          <label className="label-field">Offers these services</label>
          {services.length === 0 ? (
            <p className="text-sm text-slate">Create services first, then assign them here.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {services.map((service) => {
                const checked = serviceIds.includes(service.id);
                return (
                  <label
                    key={service.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-sm cursor-pointer transition-colors ${
                      checked ? 'border-brass bg-brass/10' : 'border-line bg-paper hover:bg-ink/5'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleService(service.id)}
                      className="h-4 w-4 rounded border-line text-brass focus:ring-brass"
                    />
                    <span className="font-medium text-ink">{service.name}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-2 border-t border-line pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">
            {busy ? 'Saving…' : isEdit ? 'Save changes' : 'Add staff'}
          </button>
        </div>
      </form>
    </div>
  );
}
