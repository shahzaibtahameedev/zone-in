import { calculateTotalPrice, formatRupees } from './price.utils';

describe('price utils', () => {
  it('multiplies price per hour by duration', () => {
    expect(calculateTotalPrice(500, 2)).toBe(1000);
    expect(calculateTotalPrice(350, 3)).toBe(1050);
  });

  it('returns 0 when the price is 0', () => {
    expect(calculateTotalPrice(0, 4)).toBe(0);
  });

  it('formats amounts as Pakistani Rupees with thousands separators', () => {
    expect(formatRupees(1000)).toBe('Rs 1,000');
    expect(formatRupees(450)).toBe('Rs 450');
    expect(formatRupees(125000)).toBe('Rs 125,000');
  });
});
