import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from './api';

export const staffKeys = {
  workspace: ['staff', 'workspace'] as const,
  calendar: (from?: string, to?: string, staffId?: string) =>
    ['staff', 'calendar', from ?? 'none', to ?? 'none', staffId ?? 'any'] as const,
  todays: ['staff', 'todays-bookings'] as const,
};

export function useMyWorkspace(enabled = true) {
  return useQuery({
    queryKey: staffKeys.workspace,
    queryFn: () => staffApi.getMyWorkspace(),
    enabled,
    retry: false,
  });
}

export function useCalendar(from?: string, to?: string, staffId?: string, enabled = true) {
  return useQuery({
    queryKey: staffKeys.calendar(from, to, staffId),
    queryFn: () => staffApi.getCalendar(from, to, staffId),
    enabled: enabled && !!from && !!to,
    retry: false,
  });
}

export function useTodaysBookings(staffId?: string, enabled = true) {
  const now = new Date();
  const todayLocal = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
  const tomorrowLocal = new Date(now.getTime() + 86400000).toLocaleDateString('en-CA', {
    timeZone: 'Asia/Manila',
  });

  return useQuery({
    queryKey: staffKeys.todays,
    queryFn: () => staffApi.getBookings({ fromDate: todayLocal, toDate: tomorrowLocal, staffId, pageSize: 100 }),
    enabled,
    retry: false,
  });
}

export function useSetBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) => staffApi.setStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}
