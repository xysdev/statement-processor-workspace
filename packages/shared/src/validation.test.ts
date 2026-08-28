import { describe, expect, it } from 'vitest';
import type { StatementRecord } from './index.js';
import { getFailedRecords, isBalanceValid, parseMoney } from './validation.js';

const records: StatementRecord[] = [
  {
    reference: '1001',
    accountNumber: 'NL01',
    description: 'Valid transaction',
    startBalance: '50.00',
    mutation: '+10.00',
    endBalance: '60.00',
    source: 'csv',
  },
  {
    reference: '1001',
    accountNumber: 'NL02',
    description: 'Duplicate transaction',
    startBalance: '20.00',
    mutation: '+5.00',
    endBalance: '25.00',
    source: 'xml',
  },
  {
    reference: '1002',
    accountNumber: 'NL03',
    description: 'Balance mismatch',
    startBalance: '15.00',
    mutation: '-2.00',
    endBalance: '14.50',
    source: 'csv',
  },
];

describe('shared validation', () => {
  it('detects duplicate references and balance mismatches', () => {
    const failed = getFailedRecords(records);

    expect(failed).toHaveLength(2);
    expect(failed[0].reason).toBe('Duplicate transaction reference');
    expect(failed[1].reason).toBe('End balance mismatch');
  });

  it('validates balance calculations', () => {
    expect(isBalanceValid('10.00', '+2.00', '12.00')).toBe(true);
    expect(isBalanceValid('10.00', '+2.00', '13.50')).toBe(false);
  });

  it('converts money values to cents', () => {
    expect(parseMoney('10.25')).toBe(1025);
    expect(parseMoney('-2.50')).toBe(-250);
  });
});
