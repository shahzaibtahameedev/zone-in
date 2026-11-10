import {
  addDays,
  endOfMonth,
  formatDisplayDate,
  formatDisplayDateTime,
  formatDisplayTime,
  isInPast,
  startOfMonth,
} from './date-time.utils';

describe('date and time utils', () => {
  it('formats dates as "08 Nov 2026"', () => {
    expect(formatDisplayDate('2026-11-08')).toBe('08 Nov 2026');
  });

  it('formats times as "4:00 PM"', () => {
    expect(formatDisplayTime('16:00')).toBe('4:00 PM');
    expect(formatDisplayTime('12:00')).toBe('12:00 PM');
    expect(formatDisplayTime('00:00')).toBe('12:00 AM');
    expect(formatDisplayTime('24:00')).toBe('12:00 AM');
  });

  it('formats a local date and time', () => {
    expect(formatDisplayDateTime('2026-11-12T18:00')).toBe('12 Nov 2026, 6:00 PM');
  });

  it('adds days across month ends', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-11-01', -1)).toBe('2026-10-31');
  });

  it('finds the first and last day of the month', () => {
    expect(startOfMonth('2026-11-11')).toBe('2026-11-01');
    expect(endOfMonth('2026-11-11')).toBe('2026-11-30');
  });

  it('knows when a date and time has passed', () => {
    const now = new Date(2026, 10, 11, 15, 30);

    expect(isInPast('2026-11-11', '14:00', now)).toBe(true);
    expect(isInPast('2026-11-11', '16:00', now)).toBe(false);
    expect(isInPast('2026-11-12', '12:00', now)).toBe(false);
  });
});
