import { MINUTES_PER_HOUR } from '../config/app.constants';
import { AvailabilityQuery, Booking } from '../models';
import { timeToMinutes } from './date-time.utils';

export function rangesOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  const overlaps = startA < endB && startB < endA;

  return overlaps;
}

export function countOverlappingBookings(bookings: Booking[], query: AvailabilityQuery): number {
  const queryStart = timeToMinutes(query.startTime);
  const queryEnd = queryStart + query.durationHours * MINUTES_PER_HOUR;

  const overlappingBookings = bookings.filter((booking) => {
    const bookingStart = timeToMinutes(booking.startTime);
    const bookingEnd = bookingStart + booking.durationHours * MINUTES_PER_HOUR;
    const isSameUnitPool =
      booking.zoneId === query.zoneId &&
      booking.consoleType === query.consoleType &&
      booking.date === query.date;
    const isCounted = booking.status === 'Confirmed' && booking.id !== query.excludeBookingId;
    const isOverlapping =
      isSameUnitPool && isCounted && rangesOverlap(queryStart, queryEnd, bookingStart, bookingEnd);

    return isOverlapping;
  });

  const overlappingCount = overlappingBookings.length;

  return overlappingCount;
}

export function countFreeUnits(
  quantity: number,
  bookings: Booking[],
  query: AvailabilityQuery,
): number {
  const freeUnits = Math.max(0, quantity - countOverlappingBookings(bookings, query));

  return freeUnits;
}
