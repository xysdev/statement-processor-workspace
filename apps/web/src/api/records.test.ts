import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchRecords } from './records';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchRecords', () => {
  it('returns records from the API response', async () => {
    const records = [
      {
        reference: '1001',
        accountNumber: 'NL01',
        description: 'Payment',
        startBalance: '10.00',
        mutation: '+2.00',
        endBalance: '12.00',
        source: 'csv' as const,
      },
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ records }), { status: 200 }),
    ));

    await expect(fetchRecords()).resolves.toEqual(records);
  });

  it('throws when the API responds with an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(null, { status: 500 }),
    ));

    await expect(fetchRecords()).rejects.toThrow('Unable to load records: 500');
  });
});
