import { BookingStatus, ConsoleType, PaymentMethod } from '../models';

export const APP_NAME = 'GameSlot';

export const OPENING_HOUR = 12;
export const CLOSING_HOUR = 24;
export const CUSTOMER_SLOT_HOURS = 2;
export const MIN_BOOKING_HOURS = 1;
export const MIN_CONSOLE_QUANTITY = 1;
export const MINUTES_PER_HOUR = 60;

export const CURRENCY_LABEL = 'Rs';
export const EMPTY_VALUE_LABEL = '—';

export const CONSOLE_TYPES: readonly ConsoleType[] = ['PS5', 'PS4', 'Xbox', 'PC Room'];
export const PAYMENT_METHODS: readonly PaymentMethod[] = ['Cash', 'Online', 'Card'];
export const BOOKING_STATUSES: readonly BookingStatus[] = ['Confirmed', 'Cancelled'];
export const ZONE_AREAS: readonly string[] = [
  'Gulshan-e-Iqbal',
  'DHA',
  'Clifton',
  'North Nazimabad',
];
export const GAMES: readonly string[] = ['FIFA', 'Tekken'];

export const CUSTOMER_NAME_MIN_LENGTH = 2;
export const CUSTOMER_NAME_MAX_LENGTH = 60;
export const ZONE_NAME_MIN_LENGTH = 2;
export const ZONE_NAME_MAX_LENGTH = 80;
export const TOURNAMENT_NAME_MIN_LENGTH = 3;
export const TOURNAMENT_NAME_MAX_LENGTH = 80;
export const TOURNAMENT_MIN_PLAYERS = 2;
export const PLAYER_NAME_MIN_LENGTH = 2;
export const PLAYER_NAME_MAX_LENGTH = 60;

export const RECENT_BOOKINGS_LIMIT = 10;
export const TOAST_DURATION_MS = 3500;
export const STORAGE_KEY_PREFIX = 'gameslot.';
