// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StatementRecord } from '@statement/shared';
import { fetchRecords, uploadStatementFiles } from '../api/records';
import { useStatementReport } from './useStatementReport';

vi.mock('../api/records', () => ({
  fetchRecords: vi.fn(),
  uploadStatementFiles: vi.fn(),
}));

const mockedFetchRecords = vi.mocked(fetchRecords);
const mockedUploadStatementFiles = vi.mocked(uploadStatementFiles);

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

const files = {
  csvFile: new File(['csv'], 'records.csv', { type: 'text/csv' }),
  xmlFile: new File(['xml'], 'records.xml', { type: 'text/xml' }),
};

describe('useStatementReport', () => {
  it('provides validation counts and filtered records', async () => {
    mockedUploadStatementFiles.mockResolvedValue('upload-1');
    mockedFetchRecords.mockResolvedValue(records);
    const { result } = renderHook(() => useStatementReport());

    let didUpload = false;
    await act(async () => {
      didUpload = await result.current.uploadRecords(files);
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(didUpload).toBe(true);
    expect(result.current.validRecordCount).toBe(1);
    expect(result.current.filterCounts).toEqual({ all: 2, mismatch: 0, duplicate: 1 });
    expect(result.current.filteredRecords).toHaveLength(2);

    result.current.setActiveFilter('duplicate');

    await waitFor(() => expect(result.current.filteredRecords).toHaveLength(1));
    expect(result.current.filteredRecords[0].description).toBe('Duplicate transaction');
  });

  it('filters only the actual duplicate record when multiple records share the same reference and description', async () => {
    const repeatedDuplicateRecords: StatementRecord[] = [
      {
        reference: '2001',
        accountNumber: 'NL01',
        description: 'Same description',
        startBalance: '10.00',
        mutation: '+1.00',
        endBalance: '11.00',
        source: 'csv',
      },
      {
        reference: '2001',
        accountNumber: 'NL02',
        description: 'Same description',
        startBalance: '11.00',
        mutation: '+1.00',
        endBalance: '12.00',
        source: 'xml',
      },
    ];

    mockedFetchRecords.mockResolvedValue(repeatedDuplicateRecords);
    const { result } = renderHook(() => useStatementReport());

    await act(async () => {
      await result.current.uploadRecords(files);
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    result.current.setActiveFilter('duplicate');

    await waitFor(() => expect(result.current.filteredRecords).toHaveLength(1));
    expect(result.current.filteredRecords[0].accountNumber).toBe('NL02');
    expect(result.current.filteredRecords[0].source).toBe('xml');
  });
});
