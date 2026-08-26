import { describe, expect, it } from 'vitest';
import { mergeStatementRecords } from './index.js';
import type { StatementRecord } from '@statement/shared';

const sampleCsv: StatementRecord[] = [
  {
    reference: '1',
    accountNumber: 'NL01',
    description: 'Groceries',
    startBalance: '10.00',
    mutation: '+2.00',
    endBalance: '12.00',
    source: 'csv',
  },
];

const sampleXml: StatementRecord[] = [
  {
    reference: '2',
    accountNumber: 'NL02',
    description: 'Books',
    startBalance: '20.00',
    mutation: '-5.00',
    endBalance: '15.00',
    source: 'xml',
  },
];

describe('mergeStatementRecords', () => {
  it('merges csv and xml records into a single list', () => {
    const merged = mergeStatementRecords(sampleCsv, sampleXml);
    expect(merged).toHaveLength(2);
    expect(merged[0].source).toBe('csv');
    expect(merged[1].source).toBe('xml');
  });
});
