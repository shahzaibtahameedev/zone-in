import { AvailabilityQuery, Booking } from '../models';
import { countFreeUnits, countOverlappingBookings, rangesOverlap } from './availability.utils';

const ZONE_ID = 'zone-1';
const OTHER_ZONE_ID = 'zone-2';
const DATE = '2026-11-20';

function createBooking(
  id: string,
  startTime: string,
  durationHours: number,
  overrides: Partial<Booking> = {},
): Booking {
  const booking: Booking = Object.assign(
    {
      id,
      zoneId: ZONE_ID,
      customerName: 'Test Customer',
      consoleType: 'PS5',
      date: DATE,
      startTime,
      durationHours,
      pricePerHour: 500,
      totalPrice: 500 * durationHours,
      status: 'Confirmed',
      createdAt: '2026-11-01T10:00:00.000Z',
    },
    overrides,
  );

  return booking;
}

function createQuery(
  startTime: string,
  durationHours: number,
  excludeBookingId?: string,
): AvailabilityQuery {
  const query: AvailabilityQuery = {
    zoneId: ZONE_ID,
    consoleType: 'PS5',
    date: DATE,
    startTime,
    durationHours,
    excludeBookingId,
  };

  return query;
}

describe('rangesOverlap', () => {
  it('detects ranges that overlap', () => {
    expect(rangesOverlap(60, 180, 120, 240)).toBe(true);
    expect(rangesOverlap(120, 240, 60, 180)).toBe(true);
  });

  it('detects a range fully inside another', () => {
    expect(rangesOverlap(60, 300, 120, 180)).toBe(true);
  });

  it('treats ranges that only touch as not overlapping', () => {
    expect(rangesOverlap(60, 120, 120, 180)).toBe(false);
    expect(rangesOverlap(120, 180, 60, 120)).toBe(false);
  });

  it('treats separate ranges as not overlapping', () => {
    expect(rangesOverlap(60, 120, 180, 240)).toBe(false);
  });
});

describe('countOverlappingBookings', () => {
  it('counts only confirmed bookings for the same zone, console and date that overlap', () => {
    const bookings = [
      createBooking('overlapping', '16:00', 2),
      createBooking('partly-overlapping', '17:00', 2),
      createBooking('touching', '18:00', 2),
      createBooking('cancelled', '16:00', 2, { status: 'Cancelled' }),
      createBooking('other-zone', '16:00', 2, { zoneId: OTHER_ZONE_ID }),
      createBooking('other-console', '16:00', 2, { consoleType: 'PS4' }),
      createBooking('other-date', '16:00', 2, { date: '2026-11-21' }),
    ];

    expect(countOverlappingBookings(bookings, createQuery('16:00', 2))).toBe(2);
  });

  it('does not count the booking being edited against itself', () => {
    const bookings = [createBooking('editing', '16:00', 2), createBooking('other', '16:00', 2)];

    expect(countOverlappingBookings(bookings, createQuery('16:00', 2, 'editing'))).toBe(1);
  });
});

describe('countFreeUnits', () => {
  it('subtracts overlapping bookings from the console quantity', () => {
    const bookings = [createBooking('first', '16:00', 2), createBooking('second', '15:00', 2)];

    expect(countFreeUnits(4, bookings, createQuery('16:00', 2))).toBe(2);
  });

  it('returns 0 when every unit is booked', () => {
    const bookings = [createBooking('first', '18:00', 2), createBooking('second', '18:00', 2)];

    expect(countFreeUnits(2, bookings, createQuery('18:00', 2))).toBe(0);
  });

  it('never returns a negative number', () => {
    const bookings = [createBooking('first', '18:00', 2), createBooking('second', '18:00', 2)];

    expect(countFreeUnits(1, bookings, createQuery('18:00', 2))).toBe(0);
  });

  it('returns the full quantity when nothing overlaps', () => {
    const bookings = [createBooking('earlier', '12:00', 2)];

    expect(countFreeUnits(3, bookings, createQuery('14:00', 2))).toBe(3);
  });
});
