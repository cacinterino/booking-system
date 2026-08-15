import api from '../../shared/api/axios';
import type { Service } from '../services/types';
import type {
  AvailabilityResponse,
  BookingResponse,
  CreateBookingRequest,
  PublicBusiness,
  PublicStaff,
} from './types';

export const publicBookingApi = {
  async getPublicBusiness(slug: string): Promise<PublicBusiness> {
    const { data } = await api.get(`/api/public/businesses/${slug}`);
    return data;
  },

  async getPublicServices(slug: string): Promise<Service[]> {
    const { data } = await api.get(`/api/public/businesses/${slug}/services`);
    return data;
  },

  async getPublicStaff(slug: string, serviceId?: string): Promise<PublicStaff[]> {
    const { data } = await api.get(`/api/public/businesses/${slug}/staff`, {
      params: serviceId ? { serviceId } : undefined,
    });
    return data;
  },

  async getAvailability(
    slug: string,
    serviceId: string,
    date: string,
    staffId?: string,
  ): Promise<AvailabilityResponse> {
    const { data } = await api.get(`/api/public/businesses/${slug}/availability`, {
      params: { serviceId, date, staffId },
    });
    return data;
  },

  async createBooking(payload: CreateBookingRequest, idempotencyKey: string): Promise<BookingResponse> {
    const { data } = await api.post('/api/bookings', payload, {
      headers: { 'Idempotency-Key': idempotencyKey },
    });
    return data;
  },

  async getMyBookings(accessCode: string, upcoming = true): Promise<BookingResponse[]> {
    const { data } = await api.get('/api/bookings/my-bookings', {
      params: { accessCode, upcoming },
    });
    return data;
  },
};
