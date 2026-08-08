export interface ServiceCategory {
  id: string;
  name: string;
  description?: string | null;
  displayOrder: number;
  serviceCount: number;
}

export interface ServiceCategoryRequest {
  name: string;
  description?: string | null;
  displayOrder?: number;
}

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  categoryId?: string | null;
  categoryName?: string | null;
  businessId: string;
  isActive: boolean;
  displayOrder: number;
  color?: string | null;
}

export interface ServiceRequest {
  name: string;
  durationMinutes: number;
  price: number;
  categoryId?: string | null;
  description?: string | null;
  isActive?: boolean;
  displayOrder?: number;
  color?: string | null;
}