import {
  CLOSING_HOUR,
  CUSTOMER_SLOT_HOURS,
  MINUTES_PER_HOUR,
  OPENING_HOUR,
} from '../config/app.constants';
import { TimeSlot } from '../models';
import { addHoursToTime, formatDisplayTime, hourToTime, timeToMinutes } from './date-time.utils';

export function getCustomerTimeSlots(): TimeSlot[] {
  const timeSlots: TimeSlot[] = [];

  for (
    let hour = OPENING_HOUR;
    hour + CUSTOMER_SLOT_HOURS <= CLOSING_HOUR;
    hour += CUSTOMER_SLOT_HOURS
  ) {
    timeSlots.push({
      startTime: hourToTime(hour),
      endTime: hourToTime(hour + CUSTOMER_SLOT_HOURS),
    });
  }

  return timeSlots;
}

export function getStartTimeOptions(): string[] {
  const startTimes: string[] = [];

  for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour++) {
    startTimes.push(hourToTime(hour));
  }

  return startTimes;
}

export function formatTimeRange(startTime: string, durationHours: number): string {
  const endTime = addHoursToTime(startTime, durationHours);
  const timeRange = `${formatDisplayTime(startTime)} – ${formatDisplayTime(endTime)}`;

  return timeRange;
}

export function isWithinOpeningHours(startTime: string, durationHours: number): boolean {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + durationHours * MINUTES_PER_HOUR;
  const isWithinHours =
    startMinutes >= OPENING_HOUR * MINUTES_PER_HOUR &&
    endMinutes <= CLOSING_HOUR * MINUTES_PER_HOUR;

  return isWithinHours;
}

export function getOpeningHoursLabel(): string {
  const openingHoursLabel = `${formatDisplayTime(hourToTime(OPENING_HOUR))} and ${formatDisplayTime(hourToTime(CLOSING_HOUR))}`;

  return openingHoursLabel;
}

export function getOpeningHoursHint(): string {
  const openingHoursHint = `Open ${formatTimeRange(hourToTime(OPENING_HOUR), CLOSING_HOUR - OPENING_HOUR)}`;

  return openingHoursHint;
}
