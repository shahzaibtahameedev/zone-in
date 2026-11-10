import { ValidationErrors } from '@angular/forms';
import { CLOSING_HOUR } from '../config/app.constants';
import { formatDisplayTime, hourToTime } from '../utils/date-time.utils';

const FALLBACK_MESSAGE = 'Please check this value.';

function readCustomMessage(errorValue: unknown): string {
  if (typeof errorValue === 'object' && errorValue !== null && 'message' in errorValue) {
    const customMessage = String(errorValue.message);

    return customMessage;
  }

  return FALLBACK_MESSAGE;
}

export function getValidationMessage(errors: ValidationErrors, label: string): string {
  const [errorKey] = Object.keys(errors);
  const errorValue = errors[errorKey];

  switch (errorKey) {
    case 'required':
      return `${label} is required.`;
    case 'minlength':
      return `Use at least ${errorValue.requiredLength} characters.`;
    case 'maxlength':
      return `Use ${errorValue.requiredLength} characters or fewer.`;
    case 'min':
      return `Must be at least ${errorValue.min}.`;
    case 'email':
      return 'Enter a valid email address.';
    case 'wholeNumber':
      return 'Use a whole number.';
    case 'positive':
      return 'Must be more than 0.';
    case 'pastDate':
      return 'Pick today or a later date.';
    case 'phone':
      return 'Use the format 03XX XXXXXXX.';
    case 'closingTime':
      return `The booking must end by ${formatDisplayTime(hourToTime(CLOSING_HOUR))}.`;
    default:
      return readCustomMessage(errorValue);
  }
}
