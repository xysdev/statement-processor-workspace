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

  it('matches the actual duplicate record when reference and description are identical', () => {
    const duplicateRecords: StatementRecord[] = [
      {
        reference: '1001',
        accountNumber: 'NL01',
        description: 'Same description',
        startBalance: '10.00',
        mutation: '+1.00',
        endBalance: '11.00',
        source: 'csv',
      },
      {
        reference: '1001',
        accountNumber: 'NL02',
        description: 'Same description',
        startBalance: '11.00',
        mutation: '+1.00',
        endBalance: '12.00',
        source: 'xml',
      },
    ];

    const failed = getFailedRecords(duplicateRecords);

    expect(failed).toHaveLength(1);
    expect(failed[0].recordIndex).toBe(1);
    expect(failed[0].description).toBe('Same description');
  });

  it('validates balance calculations', () => {
    expect(isBalanceValid('10.00', '+2.00', '12.00')).toBe(true);
    expect(isBalanceValid('10.00', '+2.00', '13.50')).toBe(false);
  });

  it('converts money values to cents without floating-point drift', () => {
    expect(parseMoney('10.25')).toBe(1025);
    expect(parseMoney('-2.50')).toBe(-250);
    expect(parseMoney('1.005')).toBe(101);
    expect(parseMoney('0.145')).toBe(15);
    expect(parseMoney('35.855')).toBe(3586);
  });
});
