import { Injectable, inject } from '@angular/core';
import {
  CUSTOMER_NAME_MAX_LENGTH,
  CUSTOMER_NAME_MIN_LENGTH,
  CUSTOMER_SLOT_HOURS,
  MIN_BOOKING_HOURS,
} from '../config/app.constants';
import {
  Booking,
  BookingDto,
  BookingFilters,
  BookingStats,
  ConsoleType,
  PaymentMethod,
  ServiceResult,
  SlotSelection,
  fail,
  succeed,
} from '../models';
import { EMAIL_PATTERN } from '../validators/form-validators';
import { summarizeBookings } from '../utils/booking-stats.utils';
import { isInPast } from '../utils/date-time.utils';
import { createId, normalizeEmail } from '../utils/id.utils';
import { calculateTotalPrice } from '../utils/price.utils';
import { getOpeningHoursLabel, isWithinOpeningHours } from '../utils/time-slot.utils';
import { AvailabilityService } from './availability.service';
import { CustomersService } from './customers.service';
import { SessionService } from './session.service';
import { StorageService } from './storage.service';

const BOOKING_ID_PREFIX = 'booking';
const BOOKING_NOT_FOUND_MESSAGE = 'Booking not found.';
const ZONE_NOT_FOUND_MESSAGE = 'Gaming zone not found.';
const ZONE_INACTIVE_MESSAGE = 'This gaming zone is not active, so it cannot take new bookings.';
const NAME_LENGTH_MESSAGE = `Customer name must be ${CUSTOMER_NAME_MIN_LENGTH} to ${CUSTOMER_NAME_MAX_LENGTH} characters.`;
const EMAIL_MESSAGE = 'Enter a valid email address.';
const DURATION_MESSAGE = 'Duration must be a whole number of hours, at least 1.';
const PAST_TIME_MESSAGE = 'This time has already passed. Pick a later date or time.';

function compareNewestFirst(first: Booking, second: Booking): number {
  const comparison =
    `${second.date}T${second.startTime}`.localeCompare(`${first.date}T${first.startTime}`) ||
    second.createdAt.localeCompare(first.createdAt);

  return comparison;
}

function compareByStartTime(first: Booking, second: Booking): number {
  const comparison =
    `${first.date}T${first.startTime}`.localeCompare(`${second.date}T${second.startTime}`) ||
    first.customerName.localeCompare(second.customerName);

  return comparison;
}

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private readonly storage = inject(StorageService);
  private readonly session = inject(SessionService);
  private readonly availability = inject(AvailabilityService);
  private readonly customers = inject(CustomersService);

  getBookings(filters: BookingFilters = {}): Booking[] {
    const scopedFilters: BookingFilters = Object.assign({}, filters, {
      zoneId: this.session.scopeZoneFilter(filters.zoneId),
    });
    const compareBookings =
      filters.sortBy === 'startTime' ? compareByStartTime : compareNewestFirst;
    const sortedBookings = this.storage
      .select('bookings')
      .filter((booking) => this.matchesFilters(booking, scopedFilters))
      .sort(compareBookings);
    const bookings =
      filters.limit === undefined ? sortedBookings : sortedBookings.slice(0, filters.limit);

    return bookings;
  }

  getBookingById(bookingId: string): Booking | undefined {
    const booking = this.storage
      .select('bookings')
      .find((item) => item.id === bookingId && this.session.canAccessZone(item.zoneId));

    return booking;
  }

  getBookingStats(filters: BookingFilters = {}): BookingStats {
    const bookingStats = summarizeBookings(this.getBookings(filters));

    return bookingStats;
  }

  getPricePerHour(
    zoneId: string,
    consoleType: ConsoleType,
    existingBookingId?: string,
  ): number | null {
    const existingBooking = existingBookingId ? this.getBookingById(existingBookingId) : undefined;
    if (
      existingBooking &&
      existingBooking.zoneId === zoneId &&
      existingBooking.consoleType === consoleType
    ) {
      return existingBooking.pricePerHour;
    }

    const scopedZoneId = this.session.scopeZoneId(zoneId);
    const consoleConfig = this.storage
      .select('consoles')
      .find((config) => config.zoneId === scopedZoneId && config.consoleType === consoleType);
    const pricePerHour = consoleConfig?.pricePerHour ?? null;

    return pricePerHour;
  }

  createBooking(dto: BookingDto): ServiceResult<Booking> {
    const scopedDto = this.scopeToSession(dto);
    const validationError = this.validateBooking(scopedDto, null);
    if (validationError !== null) {
      const failure = fail(validationError);

      return failure;
    }

    const booking = this.buildBooking(
      createId(BOOKING_ID_PREFIX),
      scopedDto,
      new Date().toISOString(),
      null,
    );
    this.storage.save('bookings', this.storage.select('bookings').concat(booking));
    const result = succeed(booking);

    return result;
  }

  createCustomerBooking(
    selection: SlotSelection,
    customerEmail: string,
    paymentMethod: PaymentMethod,
  ): ServiceResult<Booking> {
    const customer = this.customers.findOrCreateCustomer(customerEmail);
    const result = this.createBooking({
      zoneId: selection.zoneId,
      customerName: this.customers.getDisplayName(customer),
      customerEmail: customer.email,
      consoleType: selection.consoleType,
      date: selection.date,
      startTime: selection.startTime,
      durationHours: CUSTOMER_SLOT_HOURS,
      paymentMethod,
      status: 'Confirmed',
    });

    return result;
  }

  updateBooking(bookingId: string, dto: BookingDto): ServiceResult<Booking> {
    const existingBooking = this.getBookingById(bookingId);
    if (!existingBooking) {
      const notFound = fail(BOOKING_NOT_FOUND_MESSAGE);

      return notFound;
    }

    const scopedDto = this.scopeToSession(dto);
    const validationError = this.validateBooking(scopedDto, existingBooking);
    if (validationError !== null) {
      const failure = fail(validationError);

      return failure;
    }

    const updatedBooking = this.buildBooking(
      bookingId,
      scopedDto,
      existingBooking.createdAt,
      existingBooking,
    );
    this.replaceBooking(updatedBooking);
    const result = succeed(updatedBooking);

    return result;
  }

  cancelBooking(bookingId: string): ServiceResult<Booking> {
    const existingBooking = this.getBookingById(bookingId);
    if (!existingBooking) {
      const notFound = fail(BOOKING_NOT_FOUND_MESSAGE);

      return notFound;
    }

    const cancelledBooking: Booking = Object.assign({}, existingBooking, { status: 'Cancelled' });
    this.replaceBooking(cancelledBooking);
    const result = succeed(cancelledBooking);

    return result;
  }

  deleteBooking(bookingId: string): ServiceResult<Booking> {
    const existingBooking = this.getBookingById(bookingId);
    if (!existingBooking) {
      const notFound = fail(BOOKING_NOT_FOUND_MESSAGE);

      return notFound;
    }

    this.storage.save(
      'bookings',
      this.storage.select('bookings').filter((booking) => booking.id !== bookingId),
    );
    const result = succeed(existingBooking);

    return result;
  }

  private matchesFilters(booking: Booking, filters: BookingFilters): boolean {
    const filterEmail = filters.customerEmail ? normalizeEmail(filters.customerEmail) : undefined;
    const bookingEmail = booking.customerEmail ? normalizeEmail(booking.customerEmail) : undefined;

    const matches =
      (filters.zoneId === undefined || booking.zoneId === filters.zoneId) &&
      (filters.date === undefined || booking.date === filters.date) &&
      (filters.fromDate === undefined || booking.date >= filters.fromDate) &&
      (filters.toDate === undefined || booking.date <= filters.toDate) &&
      (filters.consoleType === undefined || booking.consoleType === filters.consoleType) &&
      (filters.status === undefined || booking.status === filters.status) &&
      (filterEmail === undefined || bookingEmail === filterEmail);

    return matches;
  }

  private scopeToSession(dto: BookingDto): BookingDto {
    const scopedDto: BookingDto = Object.assign({}, dto, {
      zoneId: this.session.scopeZoneId(dto.zoneId),
    });

    return scopedDto;
  }

  private validateBooking(dto: BookingDto, existingBooking: Booking | null): string | null {
    const zone = this.storage.select('zones').find((item) => item.id === dto.zoneId);
    if (!zone) {
      return ZONE_NOT_FOUND_MESSAGE;
    }

    const isNewBooking = existingBooking === null;
    if (isNewBooking && !zone.isActive) {
      return ZONE_INACTIVE_MESSAGE;
    }

    const hasConsole = this.storage
      .select('consoles')
      .some((config) => config.zoneId === dto.zoneId && config.consoleType === dto.consoleType);
    if (!hasConsole) {
      return `${zone.name} has no ${dto.consoleType} set up.`;
    }

    const nameLength = dto.customerName.trim().length;
    if (nameLength < CUSTOMER_NAME_MIN_LENGTH || nameLength > CUSTOMER_NAME_MAX_LENGTH) {
      return NAME_LENGTH_MESSAGE;
    }

    if (dto.customerEmail && !EMAIL_PATTERN.test(dto.customerEmail.trim())) {
      return EMAIL_MESSAGE;
    }

    if (!Number.isInteger(dto.durationHours) || dto.durationHours < MIN_BOOKING_HOURS) {
      return DURATION_MESSAGE;
    }

    if (!isWithinOpeningHours(dto.startTime, dto.durationHours)) {
      return `Bookings must start and end between ${getOpeningHoursLabel()}.`;
    }

    const isTimeChanged =
      isNewBooking ||
      existingBooking.date !== dto.date ||
      existingBooking.startTime !== dto.startTime;
    if (isTimeChanged && isInPast(dto.date, dto.startTime)) {
      return PAST_TIME_MESSAGE;
    }

    const availabilityError = this.checkAvailability(dto, zone.name, existingBooking?.id);

    return availabilityError;
  }

  private checkAvailability(
    dto: BookingDto,
    zoneName: string,
    excludeBookingId?: string,
  ): string | null {
    if (dto.status !== 'Confirmed') {
      return null;
    }

    const freeUnits = this.availability.getFreeUnits({
      zoneId: dto.zoneId,
      consoleType: dto.consoleType,
      date: dto.date,
      startTime: dto.startTime,
      durationHours: dto.durationHours,
      excludeBookingId,
    });
    const availabilityError =
      freeUnits > 0
        ? null
        : `No ${dto.consoleType} is free at ${zoneName} for this time. Pick another time or console type.`;

    return availabilityError;
  }

  private buildBooking(
    bookingId: string,
    dto: BookingDto,
    createdAt: string,
    existingBooking: Booking | null,
  ): Booking {
    const pricePerHour =
      this.getPricePerHour(dto.zoneId, dto.consoleType, existingBooking?.id) ?? 0;
    const customerEmail = dto.customerEmail
      ? this.customers.findOrCreateCustomer(dto.customerEmail, dto.customerName).email
      : undefined;

    const booking: Booking = {
      id: bookingId,
      zoneId: dto.zoneId,
      customerName: dto.customerName.trim(),
      customerEmail,
      consoleType: dto.consoleType,
      date: dto.date,
      startTime: dto.startTime,
      durationHours: dto.durationHours,
      pricePerHour,
      totalPrice: calculateTotalPrice(pricePerHour, dto.durationHours),
      paymentMethod: dto.paymentMethod,
      status: dto.status,
      createdAt,
    };

    return booking;
  }

  private replaceBooking(updatedBooking: Booking): void {
    const bookings = this.storage
      .select('bookings')
      .map((booking) => (booking.id === updatedBooking.id ? updatedBooking : booking));
    this.storage.save('bookings', bookings);
  }
}
