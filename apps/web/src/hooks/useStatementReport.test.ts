// @vitest-environment jsdom

import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StatementRecord } from '@statement/shared';
import { fetchRecords } from '../api/records';
import { useStatementReport } from './useStatementReport';

vi.mock('../api/records', () => ({
  fetchRecords: vi.fn(),
}));

const mockedFetchRecords = vi.mocked(fetchRecords);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

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
];

describe('useStatementReport', () => {
  it('provides validation counts and filtered records', async () => {
    mockedFetchRecords.mockResolvedValue(records);
    const { result } = renderHook(() => useStatementReport());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.validRecordCount).toBe(1);
    expect(result.current.filterCounts).toEqual({ all: 2, mismatch: 0, duplicate: 1 });
    expect(result.current.filteredRecords).toHaveLength(2);

    result.current.setActiveFilter('duplicate');

    await waitFor(() => expect(result.current.filteredRecords).toHaveLength(1));
    expect(result.current.filteredRecords[0].description).toBe('Duplicate transaction');
  });
});
