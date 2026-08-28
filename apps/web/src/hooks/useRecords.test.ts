// @vitest-environment jsdom

import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StatementRecord } from '@statement/shared';
import { fetchRecords } from '../api/records';
import { useRecords } from './useRecords';

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
    description: 'Payment',
    startBalance: '10.00',
    mutation: '+2.00',
    endBalance: '12.00',
    source: 'csv',
  },
];

describe('useRecords', () => {
  it('starts loading and then returns records', async () => {
    mockedFetchRecords.mockResolvedValue(records);
    const { result } = renderHook(() => useRecords());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.records).toEqual([]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.records).toEqual(records);
    expect(result.current.error).toBeNull();
  });

  it('returns an error when loading fails', async () => {
    mockedFetchRecords.mockRejectedValue(new Error('API unavailable'));
    const { result } = renderHook(() => useRecords());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.records).toEqual([]);
    expect(result.current.error).toBe('API unavailable');
  });
});
