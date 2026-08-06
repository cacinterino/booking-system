import api from '../../shared/api/axios';
import type { Service, ServiceCategory, ServiceCategoryRequest, ServiceRequest } from './types';

export const servicesApi = {
  async listServices(includeInactive = false): Promise<Service[]> {
    const { data } = await api.get('/api/services', { params: { includeInactive } });
    return data;
  },

  async createService(payload: ServiceRequest): Promise<Service> {
    const { data } = await api.post('/api/services', payload);
    return data;
  },

  async updateService(id: string, payload: ServiceRequest): Promise<Service> {
    const { data } = await api.put(`/api/services/${id}`, payload);
    return data;
  },

  async deleteService(id: string): Promise<void> {
    await api.delete(`/api/services/${id}`);
  },

  async listCategories(): Promise<ServiceCategory[]> {
    const { data } = await api.get('/api/services/categories');
    return data;
  },

  async createCategory(payload: ServiceCategoryRequest): Promise<ServiceCategory> {
    const { data } = await api.post('/api/services/categories', payload);
    return data;
  },

  async updateCategory(id: string, payload: ServiceCategoryRequest): Promise<ServiceCategory> {
    const { data } = await api.put(`/api/services/categories/${id}`, payload);
    return data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/api/services/categories/${id}`);
  },
};