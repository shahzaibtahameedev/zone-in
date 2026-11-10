import { ConsoleType } from './console-config.model';
import { GamingZone } from './gaming-zone.model';

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface AvailabilityQuery {
  zoneId: string;
  consoleType: ConsoleType;
  date: string;
  startTime: string;
  durationHours: number;
  excludeBookingId?: string;
}

export interface SlotSearchFilters {
  area: string | null;
  date: string;
  startTime: string | null;
  consoleType: ConsoleType | null;
}

export interface AvailableSlot {
  zone: GamingZone;
  consoleType: ConsoleType;
  pricePerHour: number;
  date: string;
  startTime: string;
  endTime: string;
  freeUnits: number;
}

export interface SlotSelection {
  zoneId: string;
  consoleType: ConsoleType;
  date: string;
  startTime: string;
}
