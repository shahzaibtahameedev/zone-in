import { Booking, BookingStatus, ConsoleType } from '../models';
import { summarizeBookings } from './booking-stats.utils';

function createBooking(
  id: string,
  consoleType: ConsoleType,
  totalPrice: number,
  status: BookingStatus,
): Booking {
  const booking: Booking = {
    id,
    zoneId: 'zone-1',
    customerName: 'Test Customer',
    consoleType,
    date: '2026-11-10',
    startTime: '16:00',
    durationHours: 2,
    pricePerHour: totalPrice / 2,
    totalPrice,
    status,
    createdAt: '2026-11-01T10:00:00.000Z',
  };

  return booking;
}

describe('summarizeBookings', () => {
  it('counts only confirmed bookings for totals and revenue', () => {
    const stats = summarizeBookings([
      createBooking('1', 'PS5', 1000, 'Confirmed'),
      createBooking('2', 'PS4', 600, 'Confirmed'),
      createBooking('3', 'PS5', 1000, 'Cancelled'),
    ]);

    expect(stats.totalBookings).toBe(2);
    expect(stats.totalRevenue).toBe(1600);
  });

  it('finds the most booked console from confirmed bookings', () => {
    const stats = summarizeBookings([
      createBooking('1', 'PS4', 600, 'Confirmed'),
      createBooking('2', 'PS4', 600, 'Confirmed'),
      createBooking('3', 'PS5', 1000, 'Confirmed'),
      createBooking('4', 'PS5', 1000, 'Cancelled'),
      createBooking('5', 'PS5', 1000, 'Cancelled'),
    ]);

    expect(stats.mostBookedConsole).toEqual({ consoleType: 'PS4', bookingCount: 2 });
  });

  it('returns no most booked console when there are no confirmed bookings', () => {
    const stats = summarizeBookings([createBooking('1', 'PS5', 1000, 'Cancelled')]);

    expect(stats.mostBookedConsole).toBeNull();
    expect(stats.totalRevenue).toBe(0);
  });
});
