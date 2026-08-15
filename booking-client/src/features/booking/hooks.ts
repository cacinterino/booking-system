import { useQuery } from '@tanstack/react-query';
import { publicBookingApi } from './api';

export const bookingKeys = {
  business: (slug: string) => ['public-business', slug] as const,
  services: (slug: string) => ['public-services', slug] as const,
  staff: (slug: string, serviceId?: string) => ['public-staff', slug, serviceId ?? 'any'] as const,
  availability: (slug: string, serviceId: string, date: string, staffId?: string) =>
    ['public-availability', slug, serviceId, date, staffId ?? 'any'] as const,
};

export function usePublicBusiness(slug: string) {
  return useQuery({
    queryKey: bookingKeys.business(slug),
    queryFn: () => publicBookingApi.getPublicBusiness(slug),
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
