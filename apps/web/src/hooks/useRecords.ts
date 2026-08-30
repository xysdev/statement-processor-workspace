import { useState } from 'react';
import type { StatementRecord } from '@statement/shared';
import { fetchRecords, uploadStatementFiles } from '../api/records';

type UseRecordsResult = {
  records: StatementRecord[];
  isLoading: boolean;
  error: string | null;
  uploadRecords: (files: { csvFile: File; xmlFile: File }) => Promise<boolean>;
};

export function useRecords(): UseRecordsResult {
  const [records, setRecords] = useState<StatementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadRecords = async (files: { csvFile: File; xmlFile: File }) => {
    setIsLoading(true);
    setError(null);

    try {
      const uploadId = await uploadStatementFiles(files);
      setRecords(await fetchRecords(uploadId));
      return true;
    } catch (requestError) {
      setRecords([]);
      setError(requestError instanceof Error ? requestError.message : 'Unable to load records.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { records, isLoading, error, uploadRecords };
}
