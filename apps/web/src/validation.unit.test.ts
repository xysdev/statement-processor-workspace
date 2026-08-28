import { describe, expect, it } from 'vitest';
import { isBalanceValid } from './validation';

describe('isBalanceValid', () => {
  it('returns true for a valid balance calculation', () => {
    expect(isBalanceValid('10.00', '+2.00', '12.00')).toBe(true);
  });

  it('returns false for a mismatched end balance', () => {
    expect(isBalanceValid('10.00', '+2.00', '13.50')).toBe(false);
  });
});
