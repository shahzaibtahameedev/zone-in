import { Pipe, PipeTransform } from '@angular/core';
import { EMPTY_VALUE_LABEL } from '../../core/config/app.constants';
import {
  formatDisplayDate,
  formatDisplayDateTime,
  formatDisplayTime,
} from '../../core/utils/date-time.utils';
import { formatRupees } from '../../core/utils/price.utils';
import { formatTimeRange } from '../../core/utils/time-slot.utils';

@Pipe({ name: 'rupees' })
export class RupeesPipe implements PipeTransform {
  transform(amount: number): string {
    const formattedAmount = formatRupees(amount);

    return formattedAmount;
  }
}

@Pipe({ name: 'displayDate' })
export class DisplayDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    const displayDate = value ? formatDisplayDate(value) : EMPTY_VALUE_LABEL;

    return displayDate;
  }
}

@Pipe({ name: 'displayTime' })
export class DisplayTimePipe implements PipeTransform {
  transform(time: string): string {
    const displayTime = formatDisplayTime(time);

    return displayTime;
  }
}

@Pipe({ name: 'displayDateTime' })
export class DisplayDateTimePipe implements PipeTransform {
  transform(value: string): string {
    const displayDateTime = formatDisplayDateTime(value);

    return displayDateTime;
  }
}

@Pipe({ name: 'timeRange' })
export class TimeRangePipe implements PipeTransform {
  transform(startTime: string, durationHours: number): string {
    const timeRange = formatTimeRange(startTime, durationHours);

    return timeRange;
  }
}

@Pipe({ name: 'orDash' })
export class OrDashPipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    const hasValue = value !== null && value !== undefined && value !== '';
    const displayValue = hasValue ? String(value) : EMPTY_VALUE_LABEL;

    return displayValue;
  }
}
