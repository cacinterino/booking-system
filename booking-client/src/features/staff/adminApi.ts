import api from '../../shared/api/axios';
import type {
  OverrideRequest,
  OverrideResponse,
  ScheduleEntryRequest,
  ScheduleResponse,
  StaffRequest,
  StaffResponse,
} from './types';

export const staffAdminApi = {
  async getStaff(includeInactive = false): Promise<StaffResponse[]> {
    const { data } = await api.get('/api/staff', { params: { includeInactive } });
    return data;
  },

  async getStaffById(id: string): Promise<StaffResponse> {
    const { data } = await api.get(`/api/staff/${id}`);
    return data;
  },

  async createStaff(payload: StaffRequest): Promise<StaffResponse> {
    const { data } = await api.post('/api/staff', payload);
    return data;
  },

  async updateStaff(id: string, payload: StaffRequest): Promise<StaffResponse> {
    const { data } = await api.put(`/api/staff/${id}`, payload);
    return data;
  },

  async deleteStaff(id: string): Promise<void> {
    await api.delete(`/api/staff/${id}`);
  },

  async getSchedule(staffId: string): Promise<ScheduleResponse> {
    const { data } = await api.get(`/api/staff/${staffId}/schedule`);
    return data;
  },

  async setSchedule(staffId: string, entries: ScheduleEntryRequest[]): Promise<ScheduleResponse> {
    const { data } = await api.put(`/api/staff/${staffId}/schedule`, { entries });
    return data;
  },

  async getOverrides(staffId: string): Promise<OverrideResponse[]> {
    const { data } = await api.get(`/api/staff/${staffId}/overrides`);
    return data;
  },

  async createOverride(staffId: string, payload: OverrideRequest): Promise<OverrideResponse> {
    const { data } = await api.post(`/api/staff/${staffId}/overrides`, payload);
    return data;
  },

  async deleteOverride(staffId: string, overrideId: string): Promise<void> {
    await api.delete(`/api/staff/${staffId}/overrides/${overrideId}`);
  },
};
