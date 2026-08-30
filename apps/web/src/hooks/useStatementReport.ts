import { useMemo, useState } from 'react';
import { getFailedRecords } from '@statement/shared';
import { useRecords } from './useRecords';
import type { RecordFilter } from '../types';

export function useStatementReport() {
  const { records, isLoading, error, uploadRecords } = useRecords();
  const [activeFilter, setActiveFilter] = useState<RecordFilter>('all');
  const failedRecords = useMemo(() => getFailedRecords(records), [records]);
  const validRecordCount = records.length - failedRecords.length;
  const filterCounts = {
    all: records.length,
    mismatch: failedRecords.filter((issue) => issue.reason === 'End balance mismatch').length,
    duplicate: failedRecords.filter((issue) => issue.reason === 'Duplicate transaction reference').length,
  };
  const filteredRecords = useMemo(() => {
    if (activeFilter === 'all') {
      return records.map((record, index) => ({ ...record, __index: index }));
    }

    const reason = activeFilter === 'mismatch'
      ? 'End balance mismatch'
      : 'Duplicate transaction reference';
    const failedIndexes = new Set<number>(
      failedRecords
        .filter((issue) => issue.reason === reason && typeof issue.recordIndex === 'number')
        .map((issue) => issue.recordIndex as number),
    );

    return records
      .map((record, index) => ({ ...record, __index: index }))
      .filter((record) => failedIndexes.has(record.__index ?? -1));
  }, [activeFilter, failedRecords, records]);

  return {
    records,
    failedRecords,
    filteredRecords,
    validRecordCount,
    filterCounts,
    activeFilter,
    setActiveFilter,
    isLoading,
    error,
    uploadRecords,
  };
}
