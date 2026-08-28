// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import type { StatementRecord, ValidationIssue } from '@statement/shared';
import { afterEach, describe, expect, it } from 'vitest';
import { RecordsTable } from './RecordsTable';

afterEach(() => {
  cleanup();
});

const validRecord: StatementRecord = {
  reference: '1001',
  accountNumber: 'NL01',
  description: 'Valid transaction',
  startBalance: '50.00',
  mutation: '+10.00',
  endBalance: '60.00',
  source: 'csv',
};

const invalidRecord: StatementRecord = {
  ...validRecord,
  reference: '1002',
  description: 'Balance mismatch',
  endBalance: '61.00',
};

const issue: ValidationIssue = {
  reference: '1002',
  description: 'Balance mismatch',
  reason: 'End balance mismatch',
};

describe('RecordsTable', () => {
  it('renders valid and invalid records with their statuses', () => {
    render(<RecordsTable records={[validRecord, invalidRecord]} failedRecords={[issue]} />);

    expect(screen.getByText('1001')).toBeTruthy();
    expect(screen.getByText('Valid')).toBeTruthy();
    expect(screen.getByText('1002')).toBeTruthy();
    expect(screen.getByText('End balance mismatch')).toBeTruthy();
  });

  it('renders an empty state when no records match the filter', () => {
    render(<RecordsTable records={[]} failedRecords={[]} />);

    expect(screen.getByText('No records match this filter.')).toBeTruthy();
  });
});
