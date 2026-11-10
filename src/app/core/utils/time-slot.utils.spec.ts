import {
  formatTimeRange,
  getCustomerTimeSlots,
  getStartTimeOptions,
  isWithinOpeningHours,
} from './time-slot.utils';

describe('time slot utils', () => {
  it('builds the six 2-hour customer slots between 12 PM and 12 AM', () => {
    const slots = getCustomerTimeSlots();

    expect(slots.map((slot) => slot.startTime)).toEqual([
      '12:00',
      '14:00',
      '16:00',
      '18:00',
      '20:00',
      '22:00',
    ]);
    expect(slots[slots.length - 1].endTime).toBe('24:00');
  });

  it('offers hourly start times from 12 PM to 11 PM', () => {
    const startTimes = getStartTimeOptions();

    expect(startTimes[0]).toBe('12:00');
    expect(startTimes[startTimes.length - 1]).toBe('23:00');
    expect(startTimes.length).toBe(12);
  });

  it('checks that a booking starts and ends inside opening hours', () => {
    expect(isWithinOpeningHours('12:00', 2)).toBe(true);
    expect(isWithinOpeningHours('22:00', 2)).toBe(true);
    expect(isWithinOpeningHours('23:00', 2)).toBe(false);
    expect(isWithinOpeningHours('11:00', 1)).toBe(false);
  });

  it('formats a time range', () => {
    expect(formatTimeRange('16:00', 2)).toBe('4:00 PM – 6:00 PM');
    expect(formatTimeRange('22:00', 2)).toBe('10:00 PM – 12:00 AM');
  });
});
