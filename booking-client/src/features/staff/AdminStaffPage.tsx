import { useState } from 'react';
import { useDeleteStaff, useStaffList } from './adminHooks';
import { useServices } from '../services/hooks';
import { StaffFormModal } from './StaffFormModal';
import { ScheduleModal } from './ScheduleModal';
import { OverrideModal } from './OverrideModal';
import type { StaffResponse } from './types';

export function AdminStaffPage() {
  const [includeInactive, setIncludeInactive] = useState(false);
  const [editing, setEditing] = useState<StaffResponse | null>(null);
  const [creating, setCreating] = useState(false);
  const [scheduleFor, setScheduleFor] = useState<StaffResponse | null>(null);
  const [overridesFor, setOverridesFor] = useState<StaffResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffResponse | null>(null);

  const staffQuery = useStaffList(includeInactive);
  const servicesQuery = useServices(true);
  const services = servicesQuery.data ?? [];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-brass-deep">Team</p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Staff</h1>
            <p className="mt-1 text-sm text-slate">Invite team members, set schedules, and manage availability.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-slate">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="h-4 w-4 rounded border-line text-brass focus:ring-brass"
              />
              Show inactive
            </label>
            <button type="button" onClick={() => setCreating(true)} className="btn-primary">
              Add staff
            </button>
          </div>
        </div>

        {staffQuery.isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-5 w-40 rounded bg-ink/10" />
                <div className="mt-3 h-4 w-56 rounded bg-ink/10" />
                <div className="mt-4 h-9 w-full rounded bg-ink/10" />
              </div>
            ))}
          </div>
        )}

        {staffQuery.isError && (
          <div className="card max-w-lg">
            <p className="text-red-600">Could not load staff. Please refresh.</p>
          </div>
        )}

        {!staffQuery.isLoading && !staffQuery.isError && (staffQuery.data ?? []).length === 0 && (
          <div className="card text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brass/30 bg-brass/10">
              <svg className="h-7 w-7 text-brass" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold text-ink">No staff yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
              Add your first team member and give them a weekly schedule so guests can book their time.
            </p>
            <button type="button" onClick={() => setCreating(true)} className="btn-primary mt-6">
              Add staff
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(staffQuery.data ?? []).map((staff) => {
            const serviceNames = staff.serviceIds
              .map((id) => services.find((s) => s.id === id)?.name)
              .filter(Boolean)
              .join(', ');
            return (
              <article key={staff.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brass/15 font-display text-lg font-semibold text-brass-deep">
                      {staff.fullName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <h2 className="font-display font-semibold text-ink">{staff.fullName}</h2>
                      <p className="text-sm text-slate">{staff.email ?? 'No email'}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs uppercase tracking-wider ${
                      staff.isActive ? 'bg-sage/10 text-sage border-sage/30' : 'bg-ink/5 text-slate border-line'
                    }`}
                  >
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {serviceNames && <p className="mt-3 text-sm text-ink-soft">{serviceNames}</p>}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                  <button type="button" onClick={() => setScheduleFor(staff)} className="btn-secondary px-3 py-1.5 text-sm">
                    Schedule
                  </button>
                  <button type="button" onClick={() => setOverridesFor(staff)} className="btn-secondary px-3 py-1.5 text-sm">
                    Overrides
                  </button>
                  <button type="button" onClick={() => setEditing(staff)} className="btn-secondary px-3 py-1.5 text-sm">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(staff)}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {scheduleFor && (
          <ScheduleModal staff={scheduleFor} services={services} onClose={() => setScheduleFor(null)} />
        )}

        {overridesFor && <OverrideModal staff={overridesFor} onClose={() => setOverridesFor(null)} />}

        {creating && <StaffFormModal services={services} onClose={() => setCreating(false)} />}

        {editing && <StaffFormModal staff={editing} services={services} onClose={() => setEditing(null)} />}

        {deleteTarget && <DeleteStaffModal staff={deleteTarget} onClose={() => setDeleteTarget(null)} />}
      </div>
    </div>
  );
}

function DeleteStaffModal({ staff, onClose }: { staff: StaffResponse; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useDeleteStaff();

  const handleDelete = async () => {
    setError(null);
    try {
      await mutateAsync(staff.id);
      onClose();
    } catch (err) {
      setError(
        (err as { response?: { data?: { title?: string; detail?: string } } }).response?.data?.title ??
          'Could not remove staff',
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" role="dialog" aria-modal="true" aria-label={`Remove ${staff.fullName}`}>
      <div className="w-full max-w-md card shadow-2xl">
        <h2 className="font-display text-xl font-semibold text-ink">Remove {staff.fullName}?</h2>
        <p className="mt-2 text-sm text-ink-soft">
          They'll be removed from your team and their schedule. Their past bookings stay on the books.
        </p>
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Keep
          </button>
          <button type="button" onClick={handleDelete} disabled={isPending} className="btn-danger disabled:opacity-50">
            {isPending ? 'Removing…' : 'Remove staff'}
          </button>
        </div>
      </div>
    </div>
  );
}
