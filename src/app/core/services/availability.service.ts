import { Injectable, inject } from '@angular/core';
import { CUSTOMER_SLOT_HOURS } from '../config/app.constants';
import {
  AvailabilityQuery,
  AvailableSlot,
  ConsoleConfig,
  GamingZone,
  SlotSearchFilters,
  TimeSlot,
} from '../models';
import { countFreeUnits } from '../utils/availability.utils';
import { isInPast } from '../utils/date-time.utils';
import { getCustomerTimeSlots } from '../utils/time-slot.utils';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly storage = inject(StorageService);

  getFreeUnits(query: AvailabilityQuery): number {
    const consoleConfig = this.storage
      .select('consoles')
      .find((config) => config.zoneId === query.zoneId && config.consoleType === query.consoleType);
    const quantity = consoleConfig?.quantity ?? 0;
    const freeUnits = countFreeUnits(quantity, this.storage.select('bookings'), query);

    return freeUnits;
  }

  searchAvailableSlots(filters: SlotSearchFilters): AvailableSlot[] {
    const matchingZones = this.storage
      .select('zones')
      .filter((zone) => zone.isActive && (filters.area === null || zone.area === filters.area));
    const timeSlots = getCustomerTimeSlots().filter(
      (slot) =>
        (filters.startTime === null || slot.startTime === filters.startTime) &&
        !isInPast(filters.date, slot.startTime),
    );

    const availableSlots: AvailableSlot[] = [];
    matchingZones.forEach((zone) => {
      const zoneConsoles = this.storage
        .select('consoles')
        .filter(
          (config) =>
            config.zoneId === zone.id &&
            (filters.consoleType === null || config.consoleType === filters.consoleType),
        );

      zoneConsoles.forEach((consoleConfig) => {
        const freeSlots = this.findFreeSlots(zone, consoleConfig, filters.date, timeSlots);
        const slotsToShow = filters.startTime === null ? freeSlots.slice(0, 1) : freeSlots;
        slotsToShow.forEach((slot) => availableSlots.push(slot));
      });
    });

    const sortedSlots = availableSlots.sort(
      (first, second) =>
        first.pricePerHour - second.pricePerHour ||
        first.startTime.localeCompare(second.startTime) ||
        first.zone.name.localeCompare(second.zone.name),
    );

    return sortedSlots;
  }

  private findFreeSlots(
    zone: GamingZone,
    consoleConfig: ConsoleConfig,
    date: string,
    timeSlots: TimeSlot[],
  ): AvailableSlot[] {
    const bookings = this.storage.select('bookings');

    const freeSlots = timeSlots
      .map((timeSlot) => {
        const freeUnits = countFreeUnits(consoleConfig.quantity, bookings, {
          zoneId: zone.id,
          consoleType: consoleConfig.consoleType,
          date,
          startTime: timeSlot.startTime,
          durationHours: CUSTOMER_SLOT_HOURS,
        });
        const availableSlot: AvailableSlot = {
          zone,
          consoleType: consoleConfig.consoleType,
          pricePerHour: consoleConfig.pricePerHour,
          date,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          freeUnits,
        };

        return availableSlot;
      })
      .filter((slot) => slot.freeUnits > 0);

    return freeSlots;
  }
}
