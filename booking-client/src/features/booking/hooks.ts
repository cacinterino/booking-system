import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicBookingApi } from './api';

export const bookingKeys = {
  business: (slug: string) => ['public-business', slug] as const,
  services: (slug: string) => ['public-services', slug] as const,
  staff: (slug: string, serviceId?: string) => ['public-staff', slug, serviceId ?? 'any'] as const,
  availability: (slug: string, serviceId: string, date: string, staffId?: string) =>
    ['public-availability', slug, serviceId, date, staffId ?? 'any'] as const,
  myBookings: (accessCode: string, upcoming: boolean) => ['my-bookings', accessCode, upcoming] as const,
};

export function usePublicBusiness(slug: string, enabled = true) {
  return useQuery({
    queryKey: bookingKeys.business(slug),
    queryFn: () => publicBookingApi.getPublicBusiness(slug),
    enabled: enabled && !!slug,
    retry: false,
  });
}

export function usePublicServices(slug: string) {
  return useQuery({
    queryKey: bookingKeys.services(slug),
    queryFn: () => publicBookingApi.getPublicServices(slug),
    retry: false,
  });
}

export function usePublicStaff(slug: string, serviceId?: string, enabled = true) {
  return useQuery({
    queryKey: bookingKeys.staff(slug, serviceId),
    queryFn: () => publicBookingApi.getPublicStaff(slug, serviceId),
    enabled: enabled && !!slug,
    retry: false,
  });
}

export function usePublicAvailability(
  slug: string,
  serviceId: string,
  date: string,
  staffId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: bookingKeys.availability(slug, serviceId, date, staffId),
    queryFn: () => publicBookingApi.getAvailability(slug, serviceId, date, staffId),
    enabled: enabled && !!slug && !!serviceId && !!date,
    retry: false,
  });
}

export function useMyBookings(accessCode: string, upcoming: boolean, enabled = true) {
  return useQuery({
    queryKey: bookingKeys.myBookings(accessCode, upcoming),
    queryFn: () => publicBookingApi.getMyBookings(accessCode, upcoming),
    enabled,
    retry: false,
  });
}

export function useCancelBooking(accessCode: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      publicBookingApi.cancelBooking(id, { reason: reason ?? null, accessCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
}

export function useRescheduleBooking(accessCode: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, startTime }: { id: string; startTime: string }) =>
      publicBookingApi.rescheduleBooking(id, { startTime, accessCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
}
