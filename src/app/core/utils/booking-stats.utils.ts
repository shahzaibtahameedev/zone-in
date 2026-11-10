import { CONSOLE_TYPES } from '../config/app.constants';
import { Booking, BookingStats, ConsoleType, MostBookedConsole } from '../models';

function findMostBookedConsole(confirmedBookings: Booking[]): MostBookedConsole | null {
  const bookingCounts = new Map<ConsoleType, number>();
  confirmedBookings.forEach((booking) => {
    bookingCounts.set(booking.consoleType, (bookingCounts.get(booking.consoleType) ?? 0) + 1);
  });

  let mostBookedConsole: MostBookedConsole | null = null;
  for (const consoleType of CONSOLE_TYPES) {
    const bookingCount = bookingCounts.get(consoleType) ?? 0;
    const isHigherCount = bookingCount > (mostBookedConsole?.bookingCount ?? 0);
    if (isHigherCount) {
      mostBookedConsole = { consoleType, bookingCount };
    }
  }

  return mostBookedConsole;
}

export function summarizeBookings(bookings: Booking[]): BookingStats {
  const confirmedBookings = bookings.filter((booking) => booking.status === 'Confirmed');
  const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

  const bookingStats: BookingStats = {
    totalBookings: confirmedBookings.length,
    totalRevenue,
    mostBookedConsole: findMostBookedConsole(confirmedBookings),
  };

  return bookingStats;
}
