export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  status: number;
  staffId: string;
  customerName: string;
}

export interface BookingListResponse {
  items: BookingItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BookingItem {
  id: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  customerId: string;
  customerName: string;
  startTime: string;
  endTime: string;
  status: number;
  totalAmount: number;
  notes?: string | null;
  accessCode?: string | null;
}

export interface WorkspaceResponse {
  staff: StaffResponse;
  schedule: ScheduleResponse;
  overrides: OverrideResponse[];
  businessId: string;
  businessName: string;
  businessSlug: string;
}

export interface StaffResponse {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  businessId: string;
  isActive: boolean;
  displayOrder: number;
  userId?: string | null;
  serviceIds: string[];
}

export interface ScheduleResponse {
  staffId: string;
  entries: ScheduleEntryResponse[];
}

export interface ScheduleEntryResponse {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

export interface OverrideResponse {
  id: string;
  date: string;
  isTimeOff: boolean;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
}

export interface StaffRequest {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  isActive: boolean;
  displayOrder: number;
  serviceIds: string[];
  avatarUrl?: string | null;
}

export interface ScheduleEntryRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

export interface OverrideRequest {
  date: string;
  isTimeOff: boolean;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
}

export const BookingStatusLabel: Record<number, string> = {
  1: 'Pending',
  2: 'Confirmed',
  3: 'Cancelled',
  4: 'Completed',
  5: 'No-show',
};
