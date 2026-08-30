import { useState } from 'react';
import { useStatementReport } from './hooks/useStatementReport';
import { LoadingState } from './components/LoadingState/LoadingState';
import { RecordFilterSelect } from './components/RecordFilterSelect/RecordFilterSelect';
import { RecordsTable } from './components/RecordsTable/RecordsTable';
import { StatementUploadForm } from './components/StatementUploadForm/StatementUploadForm';
import { ValidationSummary } from './components/ValidationSummary/ValidationSummary';

export default function App() {
  const report = useStatementReport();
  const [isUploadFormVisible, setIsUploadFormVisible] = useState(() => report.records.length === 0);
  const hasRecords = report.records.length > 0;
  const showUploadForm = isUploadFormVisible || !hasRecords;
  const showResults = hasRecords && !showUploadForm;

  const uploadRecords = async (files: { csvFile: File; xmlFile: File }) => {
    const didUpload = await report.uploadRecords(files);

    if (didUpload) {
      setIsUploadFormVisible(false);
    }
  };

  return (
    <main className="layout__shell">
      <header className="topbar">
        <div className="topbar__brand">
          <p className="topbar__eyebrow">Statement Processor</p>
          <h1 className="topbar__title">Customer statement processor</h1>
        </div>
        {showResults ? (
          <div className="topbar__actions">
            <button className="btn btn--primary" onClick={() => window.print()}>
              Export PDF
            </button>
          </div>
        ) : null}
      </header>

      <section className="panel">
        {!showResults ? (
          <>
            <StatementUploadForm isUploading={report.isLoading} onSubmit={uploadRecords} />
            {report.isLoading ? (
              <LoadingState />
            ) : report.error ? (
              <p className="error-state" role="alert">{report.error}</p>
            ) : !hasRecords ? (
              <p className="empty-state">Upload CSV and XML statement files to see validation results.</p>
            ) : null}
          </>
        ) : (
          <>
            <div className="panel__header">
              <h2 className="panel__title">Validation results</h2>
              <button className="btn btn--ghost" type="button" onClick={() => setIsUploadFormVisible(true)}>
                Upload again
              </button>
            </div>
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
