import api from '../../shared/api/axios';
import type { BookingListResponse, CalendarEvent, WorkspaceResponse } from './types';

export const staffApi = {
  async getMyWorkspace(): Promise<WorkspaceResponse> {
    const { data } = await api.get('/api/staff/me');
    return data;
  },

  async getCalendar(from?: string, to?: string, staffId?: string): Promise<CalendarEvent[]> {
    const { data } = await api.get('/api/bookings/calendar', {
      params: { from, to, staffId },
    });
    return data;
  },

  async getBookings(params: {
    status?: number;
    staffId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<BookingListResponse> {
    const { data } = await api.get('/api/bookings', { params });
    return data;
  },

  async setStatus(id: string, status: number): Promise<void> {
    await api.put(`/api/bookings/${id}/status`, { status });
  },
};
