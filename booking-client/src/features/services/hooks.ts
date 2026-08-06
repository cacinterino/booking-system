import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from './api';
import type { ServiceCategoryRequest, ServiceRequest } from './types';

export const servicesKeys = {
  all: ['services'] as const,
  list: (includeInactive: boolean) => ['services', 'list', includeInactive] as const,
  categories: ['services', 'categories'] as const,
};

export function useServices(includeInactive = false) {
  return useQuery({
    queryKey: servicesKeys.list(includeInactive),
    queryFn: () => servicesApi.listServices(includeInactive),
  });
}

export function useServiceCategories() {
  return useQuery({
    queryKey: servicesKeys.categories,
    queryFn: () => servicesApi.listCategories(),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ServiceRequest) => servicesApi.createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ServiceRequest }) =>
      servicesApi.updateService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesApi.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ServiceCategoryRequest) => servicesApi.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ServiceCategoryRequest }) =>
      servicesApi.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.all });
    },
  });
}