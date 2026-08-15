import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffAdminApi } from './adminApi';

export const staffAdminKeys = {
  list: (includeInactive: boolean) => ['staff-admin', 'list', includeInactive] as const,
  staff: (id: string) => ['staff-admin', 'staff', id] as const,
  schedule: (staffId: string) => ['staff-admin', 'schedule', staffId] as const,
  overrides: (staffId: string) => ['staff-admin', 'overrides', staffId] as const,
};

export function useStaffList(includeInactive = false) {
  return useQuery({
    queryKey: staffAdminKeys.list(includeInactive),
    queryFn: () => staffAdminApi.getStaff(includeInactive),
    retry: false,
  });
}

export function useStaffSchedule(staffId: string, enabled = true) {
  return useQuery({
    queryKey: staffAdminKeys.schedule(staffId),
    queryFn: () => staffAdminApi.getSchedule(staffId),
    enabled: enabled && !!staffId,
    retry: false,
  });
}

export function useStaffOverrides(staffId: string, enabled = true) {
  return useQuery({
    queryKey: staffAdminKeys.overrides(staffId),
    queryFn: () => staffAdminApi.getOverrides(staffId),
    enabled: enabled && !!staffId,
    retry: false,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof staffAdminApi.createStaff>[0]) => staffAdminApi.createStaff(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-admin', 'list'] }),
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof staffAdminApi.updateStaff>[1] }) =>
      staffAdminApi.updateStaff(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-admin', 'list'] }),
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffAdminApi.deleteStaff(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-admin', 'list'] }),
  });
}

export function useSetSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, entries }: { staffId: string; entries: Parameters<typeof staffAdminApi.setSchedule>[1] }) =>
      staffAdminApi.setSchedule(staffId, entries),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: staffAdminKeys.schedule(vars.staffId) });
      queryClient.invalidateQueries({ queryKey: ['staff', 'workspace'] });
    },
  });
}

export function useCreateOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      staffId,
      payload,
    }: {
      staffId: string;
      payload: Parameters<typeof staffAdminApi.createOverride>[1];
    }) => staffAdminApi.createOverride(staffId, payload),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: staffAdminKeys.overrides(vars.staffId) });
      queryClient.invalidateQueries({ queryKey: ['staff', 'workspace'] });
    },
  });
}

export function useDeleteOverride() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, overrideId }: { staffId: string; overrideId: string }) =>
      staffAdminApi.deleteOverride(staffId, overrideId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: staffAdminKeys.overrides(vars.staffId) });
      queryClient.invalidateQueries({ queryKey: ['staff', 'workspace'] });
    },
  });
}
