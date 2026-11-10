import { ConsoleType } from './console-config.model';

export type PaymentMethod = 'Cash' | 'Online' | 'Card';

export type BookingStatus = 'Confirmed' | 'Cancelled';

export type BookingSortOrder = 'newest' | 'startTime';

export interface Booking {
  id: string;
  zoneId: string;
  customerName: string;
  customerEmail?: string;
  consoleType: ConsoleType;
  date: string;
  startTime: string;
  durationHours: number;
  pricePerHour: number;
  totalPrice: number;
  paymentMethod?: PaymentMethod;
  status: BookingStatus;
  createdAt: string;
}

export interface BookingDto {
  zoneId: string;
  customerName: string;
  customerEmail?: string;
  consoleType: ConsoleType;
  date: string;
  startTime: string;
  durationHours: number;
  paymentMethod?: PaymentMethod;
  status: BookingStatus;
}

export interface BookingFilters {
  zoneId?: string;
  date?: string;
  fromDate?: string;
  toDate?: string;
  consoleType?: ConsoleType;
  status?: BookingStatus;
  customerEmail?: string;
  sortBy?: BookingSortOrder;
  limit?: number;
}

export interface MostBookedConsole {
  consoleType: ConsoleType;
  bookingCount: number;
}

export interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  mostBookedConsole: MostBookedConsole | null;
}
