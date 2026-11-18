import { useState } from 'react';
import { useDeleteStaff, useStaffList } from './adminHooks';
import { useServices } from '../services/hooks';
import { StaffFormModal } from './StaffFormModal';
import { ScheduleModal } from './ScheduleModal';
import { OverrideModal } from './OverrideModal';
import type { StaffResponse } from './types';
import { Card, Badge, Button, EmptyState, LoadingSkeleton, Modal } from '../../shared/ui';

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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-line">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-brass-deep mb-1.5">
              Team &amp; Practitioners
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">
              Staff &amp; Schedules
            </h1>
            <p className="mt-1 text-sm text-slate">
              Invite team members, assign services, configure weekly shifts, and manage availability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-mono uppercase text-slate cursor-pointer">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="h-4 w-4 rounded border-line text-brass focus:ring-brass"
              />
              Show inactive
            </label>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreating(true)}
            >
              + Add Staff Member
            </Button>
          </div>
        </div>

        {staffQuery.isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <LoadingSkeleton key={i} className="h-52 w-full" />
            ))}
          </div>
        )}

        {staffQuery.isError && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
            Could not load staff members. Please refresh your browser.
          </div>
        )}

        {!staffQuery.isLoading && !staffQuery.isError && (staffQuery.data ?? []).length === 0 && (
          <Card>
            <EmptyState
              title="No staff members yet"
              description="Add your first team member and configure their weekly schedule so clients can book appointments with them."
              icon={
                <svg className="w-8 h-8 text-brass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              action={
                <Button variant="primary" size="sm" onClick={() => setCreating(true)}>
                  Add staff member
                </Button>
              }
            />
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(staffQuery.data ?? []).map((staff) => {
            const serviceNames = staff.serviceIds
              .map((id) => services.find((s) => s.id === id)?.name)
              .filter(Boolean)
              .join(', ');

            return (
              <Card key={staff.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brass/15 font-display text-lg font-bold text-brass-deep shrink-0">
                        {staff.fullName.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <h2 className="font-display text-lg font-bold text-ink">
                          {staff.fullName}
                        </h2>
                        <p className="text-xs text-slate font-mono mt-0.5">
                          {staff.email ?? 'No email associated'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={staff.isActive ? 'sage' : 'slate'}>
                      {staff.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line">
                    <p className="text-xs font-mono uppercase tracking-wider text-slate mb-1">
                      Assigned Services
                    </p>
                    <p className="text-sm text-ink leading-relaxed">
                      {serviceNames || 'No specific services assigned'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setScheduleFor(staff)}
                  >
                    Schedule
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setOverridesFor(staff)}
                  >
                    Overrides
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditing(staff)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(staff)}
                  >
                    Remove
                  </Button>
                </div>
              </Card>
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
          'Could not remove staff member',
      );
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Remove ${staff.fullName}?`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate">
          They will be removed from your active team and roster. Their past bookings and historical appointments will remain preserved for audit.
        </p>
        {error && <p role="alert" className="text-xs font-mono text-red-600">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Keep
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? 'Removing...' : 'Confirm Remove'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
