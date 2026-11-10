import { CURRENCY_LABEL } from '../config/app.constants';

const NUMBER_LOCALE = 'en-US';

export function calculateTotalPrice(pricePerHour: number, durationHours: number): number {
  const totalPrice = pricePerHour * durationHours;

  return totalPrice;
}

export function formatRupees(amount: number): string {
  const formattedAmount = `${CURRENCY_LABEL} ${amount.toLocaleString(NUMBER_LOCALE)}`;

  return formattedAmount;
}
