import { MINUTES_PER_HOUR } from '../config/app.constants';

const MONTH_SHORT_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const ISO_DATE_LENGTH = 10;
const HOURS_PER_DAY = 24;
const NOON_HOUR = 12;
const HOURS_ON_CLOCK_FACE = 12;
const TWO_DIGITS = 2;

function padTwoDigits(value: number): string {
  const paddedValue = String(value).padStart(TWO_DIGITS, '0');

  return paddedValue;
}

export function toIsoDate(date: Date): string {
  const isoDate = `${date.getFullYear()}-${padTwoDigits(date.getMonth() + 1)}-${padTwoDigits(date.getDate())}`;

  return isoDate;
}

export function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date;
}

export function todayIsoDate(): string {
  const today = toIsoDate(new Date());

  return today;
}

export function addDays(isoDate: string, days: number): string {
  const date = parseIsoDate(isoDate);
  date.setDate(date.getDate() + days);
  const shiftedDate = toIsoDate(date);

  return shiftedDate;
}

export function startOfMonth(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  const firstDayOfMonth = toIsoDate(new Date(date.getFullYear(), date.getMonth(), 1));

  return firstDayOfMonth;
}

export function endOfMonth(isoDate: string): string {
  const date = parseIsoDate(isoDate);
  const lastDayOfMonth = toIsoDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));

  return lastDayOfMonth;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * MINUTES_PER_HOUR + minutes;

  return totalMinutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  const time = `${padTwoDigits(hours)}:${padTwoDigits(minutes)}`;

  return time;
}

export function hourToTime(hour: number): string {
  const time = minutesToTime(hour * MINUTES_PER_HOUR);

  return time;
}

export function addHoursToTime(time: string, hours: number): string {
  const shiftedTime = minutesToTime(timeToMinutes(time) + hours * MINUTES_PER_HOUR);

  return shiftedTime;
}

export function toLocalDateTime(isoDate: string, time: string): Date {
  const dateTime = parseIsoDate(isoDate);
  dateTime.setHours(0, timeToMinutes(time), 0, 0);

  return dateTime;
}

export function isInPast(isoDate: string, time: string, now: Date = new Date()): boolean {
  const hasPassed = toLocalDateTime(isoDate, time).getTime() < now.getTime();

  return hasPassed;
}

function toDate(value: string): Date {
  if (value.length === ISO_DATE_LENGTH) {
    const dateOnly = parseIsoDate(value);

    return dateOnly;
  }

  const dateTime = new Date(value);

  return dateTime;
}

export function formatDisplayDate(value: string): string {
  const date = toDate(value);
  const displayDate = `${padTwoDigits(date.getDate())} ${MONTH_SHORT_NAMES[date.getMonth()]} ${date.getFullYear()}`;

  return displayDate;
}

export function formatDisplayTime(time: string): string {
  const totalMinutes = timeToMinutes(time);
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR) % HOURS_PER_DAY;
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  const period = hours < NOON_HOUR ? 'AM' : 'PM';
  const clockHour = hours % HOURS_ON_CLOCK_FACE || HOURS_ON_CLOCK_FACE;
  const displayTime = `${clockHour}:${padTwoDigits(minutes)} ${period}`;

  return displayTime;
}

export function formatDisplayDateTime(value: string): string {
  const date = toDate(value);
  const time = `${padTwoDigits(date.getHours())}:${padTwoDigits(date.getMinutes())}`;
  const displayDateTime = `${formatDisplayDate(value)}, ${formatDisplayTime(time)}`;

  return displayDateTime;
}

export function toLocalIsoDateTime(isoDate: string, time: string): string {
  const isoDateTime = `${isoDate}T${time}`;

  return isoDateTime;
}
