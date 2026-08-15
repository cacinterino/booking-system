export interface PublicBusiness {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  timezone: string;
  requireDeposit: boolean;
  depositAmount: number;
  currency: string;
  advanceBookingDays: number;
  slotIntervalMinutes: number;
}

export interface PublicStaff {
  id: string;
  fullName: string;
  displayOrder: number;
  serviceIds: string[];
}

export interface AvailableSlot {
  staffId: string;
  staffName: string;
  start: string;
  end: string;
  startUtc: string;
  endUtc: string;
}

export interface AvailabilityResponse {
  serviceId: string;
  serviceName: string;
  date: string;
  durationMinutes: number;
  slots: AvailableSlot[];
}

export interface GuestContact {
  name: string;
  email: string;
  phone?: string | null;
}

export interface CreateBookingRequest {
  businessId: string;
  serviceId: string;
  staffId: string;
  startTime: string;
  notes?: string | null;
  guestContact?: GuestContact | null;
}

export interface BookingResponse {
  id: string;
  businessId: string;
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
