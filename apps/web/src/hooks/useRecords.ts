import { useEffect, useState } from 'react';
import type { StatementRecord } from '@statement/shared';
import { fetchRecords } from '../api/records';

type UseRecordsResult = {
  records: StatementRecord[];
  isLoading: boolean;
  error: string | null;
};

export function useRecords(): UseRecordsResult {
  const [records, setRecords] = useState<StatementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadRecords = async () => {
      try {
        const loadedRecords = await fetchRecords();

        if (isMounted) {
          setRecords(loadedRecords);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load records.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadRecords();

    return () => {
      isMounted = false;
    };
  }, []);

  return { records, isLoading, error };
}
