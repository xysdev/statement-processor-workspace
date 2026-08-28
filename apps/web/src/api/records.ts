import type { StatementRecord } from '@statement/shared';

type RecordsResponse = {
  records: StatementRecord[];
};

export async function fetchRecords(): Promise<StatementRecord[]> {
  const response = await fetch('http://localhost:3001/api/records');

  if (!response.ok) {
    throw new Error(`Unable to load records: ${response.status}`);
  }

  const data = (await response.json()) as RecordsResponse;
  return data.records;
}
