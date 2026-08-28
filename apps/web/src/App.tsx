import { useStatementReport } from './hooks/useStatementReport';
import { LoadingState } from './components/LoadingState/LoadingState';
import { RecordFilterSelect } from './components/RecordFilterSelect/RecordFilterSelect';
import { RecordsTable } from './components/RecordsTable/RecordsTable';
import { ValidationSummary } from './components/ValidationSummary/ValidationSummary';

export default function App() {
  const report = useStatementReport();

  return (
    <main className="layout__shell">
      <header className="topbar">
        <div className="topbar__brand">
          <p className="topbar__eyebrow">Statement Processor</p>
          <h1 className="topbar__title">Customer statement processor</h1>
        </div>
        <div className="topbar__actions">
          <button className="btn btn--primary" onClick={() => window.print()}>
            Export PDF
          </button>
        </div>
      </header>

      <section className="panel">
        <h2 className="panel__title">Validation results</h2>

        {report.isLoading ? (
          <LoadingState />
        ) : report.error ? (
          <p className="error-state" role="alert">{report.error}</p>
        ) : (
          <>
            <ValidationSummary
              total={report.records.length}
              valid={report.validRecordCount}
              failed={report.failedRecords.length}
            />
            <RecordFilterSelect
              value={report.activeFilter}
              counts={report.filterCounts}
              onChange={report.setActiveFilter}
            />
            <RecordsTable records={report.filteredRecords} failedRecords={report.failedRecords} />
          </>
        )}
      </section>
    </main>
  );
}
