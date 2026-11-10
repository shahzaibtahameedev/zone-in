import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { todayIsoDate } from '../utils/date-time.utils';
import { isWithinOpeningHours } from '../utils/time-slot.utils';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAKISTANI_PHONE_PATTERN = /^03\d{2}[\s-]?\d{7}$/;

function isEmpty(value: unknown): boolean {
  const empty = value === null || value === undefined || value === '';

  return empty;
}

export function emailFormatValidator(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) {
    return null;
  }

  const errors = EMAIL_PATTERN.test(String(control.value).trim()) ? null : { email: true };

  return errors;
}

export function wholeNumberValidator(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) {
    return null;
  }

  const errors = Number.isInteger(Number(control.value)) ? null : { wholeNumber: true };

  return errors;
}

export function positiveNumberValidator(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) {
    return null;
  }

  const errors = Number(control.value) > 0 ? null : { positive: true };

  return errors;
}

export function notBeforeTodayValidator(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) {
    return null;
  }

  const errors = String(control.value) < todayIsoDate() ? { pastDate: true } : null;

  return errors;
}

export function pakistaniPhoneValidator(control: AbstractControl): ValidationErrors | null {
  if (isEmpty(control.value)) {
    return null;
  }

  const errors = PAKISTANI_PHONE_PATTERN.test(String(control.value).trim())
    ? null
    : { phone: true };

  return errors;
}

export function endsByClosingTimeValidator(startTimeControlName: string): ValidatorFn {
  const validator = (control: AbstractControl): ValidationErrors | null => {
    const startTime = control.parent?.get(startTimeControlName)?.value;
    const durationHours = Number(control.value);
    const canCheck =
      typeof startTime === 'string' &&
      startTime !== '' &&
      Number.isInteger(durationHours) &&
      durationHours > 0;
    if (!canCheck) {
      return null;
    }

    const errors = isWithinOpeningHours(startTime, durationHours) ? null : { closingTime: true };

    return errors;
  };

  return validator;
}

export function ruleValidator(
  isRuleBroken: (value: string) => boolean,
  message: string,
): ValidatorFn {
  const validator = (control: AbstractControl): ValidationErrors | null => {
    if (isEmpty(control.value)) {
      return null;
    }

    const errors = isRuleBroken(String(control.value)) ? { rule: { message } } : null;

    return errors;
  };

  return validator;
}

export function minimumValueValidator(getMinimum: () => number, message: string): ValidatorFn {
  const validator = (control: AbstractControl): ValidationErrors | null => {
    if (isEmpty(control.value)) {
      return null;
    }

    const errors = Number(control.value) < getMinimum() ? { belowMinimum: { message } } : null;

    return errors;
  };

  return validator;
}
