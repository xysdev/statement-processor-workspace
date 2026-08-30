// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StatementRecord } from '@statement/shared';
import { fetchRecords, uploadStatementFiles } from '../api/records';
import { useRecords } from './useRecords';

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
    description: 'Payment',
    startBalance: '10.00',
    mutation: '+2.00',
    endBalance: '12.00',
    source: 'csv',
  },
];

const files = {
  csvFile: new File(['csv'], 'records.csv', { type: 'text/csv' }),
  xmlFile: new File(['xml'], 'records.xml', { type: 'text/xml' }),
};

describe('useRecords', () => {
  it('uploads files and then returns records', async () => {
    mockedUploadStatementFiles.mockResolvedValue('upload-1');
    mockedFetchRecords.mockResolvedValue(records);
    const { result } = renderHook(() => useRecords());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.records).toEqual([]);

    let didUpload = false;
    await act(async () => {
      didUpload = await result.current.uploadRecords(files);
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(didUpload).toBe(true);
    expect(result.current.records).toEqual(records);
    expect(result.current.error).toBeNull();
    expect(mockedUploadStatementFiles).toHaveBeenCalledWith(files);
    expect(mockedFetchRecords).toHaveBeenCalledWith('upload-1');
  });

  it('returns an error when loading fails', async () => {
    mockedUploadStatementFiles.mockResolvedValue('upload-1');
    mockedFetchRecords.mockRejectedValue(new Error('API unavailable'));
    const { result } = renderHook(() => useRecords());

    let didUpload = true;
    await act(async () => {
      didUpload = await result.current.uploadRecords(files);
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(didUpload).toBe(false);
    expect(result.current.records).toEqual([]);
    expect(result.current.error).toBe('API unavailable');
  });
});
