import { useEffect, useMemo, useState } from 'react';
import type { StatementRecord } from '@statement/shared';
import { getFailedRecords } from './validation';

export default function App() {
  const [records, setRecords] = useState<StatementRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/records');
        const data = (await response.json()) as { records: StatementRecord[] };
        setRecords(data.records);
      } catch (error) {
        console.error('Unable to fetch merged records', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadRecords();
  }, []);

  const failedRecords = useMemo(() => getFailedRecords(records), [records]);

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <main className="layout__shell">
      <header className="topbar">
        <div className="topbar__brand">
          <p className="topbar__eyebrow">Statement Processor</p>
          <h1 className="topbar__title">Customer statement processor</h1>
        </div>
        <div className="topbar__actions">
          <button className="btn btn--primary" onClick={handleExportPdf}>
            Export PDF
          </button>
        </div>
      </header>

      <section className="panel">
        <h2 className="panel__title">Validation results</h2>

        {isLoading ? (
          <div className="loading">
            <span className="loading__spinner" aria-hidden="true" />
            <span>Loading merged records…</span>
          </div>
        ) : (
          <>
            <p className="panel__summary">
              {failedRecords.length} failed transaction{failedRecords.length === 1 ? '' : 's'} found.
            </p>

            <table className="results-table">
              <thead className="results-table__head">
                <tr>
                  <th>Reference</th>
                  <th>Description</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody className="results-table__body">
                {failedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="results-table__empty">
                      No failed records detected.
                    </td>
                  </tr>
                ) : (
                  failedRecords.map((issue) => (
                    <tr key={`${issue.reference}-${issue.description}-${issue.reason}`}>
                      <td>{issue.reference}</td>
                      <td>{issue.description}</td>
                      <td>
                        <span className="results-table__reason-badge">{issue.reason}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}
      </section>
    </main>
  );
}
