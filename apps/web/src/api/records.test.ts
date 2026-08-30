import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchRecords, uploadStatementFiles } from './records';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchRecords', () => {
  it('uploads files and returns the upload id', async () => {
    const csvFile = new File(['csv'], 'records.csv', { type: 'text/csv' });
    const xmlFile = new File(['xml'], 'records.xml', { type: 'text/xml' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ uploadId: 'upload-1' }), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      }),
    ));

    await expect(uploadStatementFiles({ csvFile, xmlFile })).resolves.toBe('upload-1');
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/records/upload', {
      method: 'POST',
      body: expect.any(FormData),
    });
  });

  it('returns records from a saved upload', async () => {
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

    await expect(fetchRecords('upload-1')).resolves.toEqual(records);
    expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/records/upload-1');
  });

  it('throws when the API responds with an error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(null, { status: 500 }),
    ));

    await expect(fetchRecords('upload-1')).rejects.toThrow('Unable to load records: 500');
  });
});
