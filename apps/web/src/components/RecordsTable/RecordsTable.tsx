import type { StatementRecord, ValidationIssue } from '@statement/shared';

type RecordsTableProps = {
  records: StatementRecord[];
  failedRecords: ValidationIssue[];
};

type IndexedRecord = StatementRecord & { __index?: number };

export function RecordsTable({ records, failedRecords }: RecordsTableProps) {
  const getIssueForRecord = (record: IndexedRecord): ValidationIssue | undefined => {
    if (typeof record.__index === 'number') {
      return failedRecords.find((issue) => issue.recordIndex === record.__index);
    }

    return failedRecords.find(
      (issue) => issue.reference === record.reference && issue.description === record.description,
    );
  };

  return (
    <table className="results-table">
      <caption className="sr-only">Filtered transaction records</caption>
      <thead className="results-table__head">
        <tr>
          <th>Reference</th>
          <th>Description</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody className="results-table__body">
        {records.length === 0 ? (
          <tr>
            <td colSpan={3} className="results-table__empty">
              No records match this filter.
            </td>
          </tr>
        ) : (
          records.map((record) => {
            const issue = getIssueForRecord(record as IndexedRecord);

            return (
              <tr key={`${record.reference}-${record.description}-${record.source}-${(record as IndexedRecord).__index ?? 'raw'}`}>
                <td>{record.reference}</td>
                <td>{record.description}</td>
                <td>
                  <span className={`results-table__reason-badge${issue ? '' : ' results-table__reason-badge--valid'}`}>
                    {issue?.reason ?? 'Valid'}
                  </span>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
