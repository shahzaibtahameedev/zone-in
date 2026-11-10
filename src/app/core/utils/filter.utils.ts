import { BOOKING_STATUSES, CONSOLE_TYPES } from '../config/app.constants';
import { BookingStatus, ConsoleType, FilterOption } from '../models';

export const ALL_FILTER_VALUE = '';

export function toConsoleType(value: string): ConsoleType | undefined {
  const consoleType = CONSOLE_TYPES.find((type) => type === value);

  return consoleType;
}

export function toBookingStatus(value: string): BookingStatus | undefined {
  const bookingStatus = BOOKING_STATUSES.find((status) => status === value);

  return bookingStatus;
}

export function toOptionalFilter(value: string): string | undefined {
  const filterValue = value === ALL_FILTER_VALUE ? undefined : value;

  return filterValue;
}

export function buildFilterOptions(values: readonly string[], allLabel: string): FilterOption[] {
  const allOption: FilterOption = { label: allLabel, value: ALL_FILTER_VALUE };
  const filterOptions = [allOption].concat(values.map((value) => ({ label: value, value })));

  return filterOptions;
}
