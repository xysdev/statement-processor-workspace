type ValidationSummaryProps = {
  total: number;
  valid: number;
  failed: number;
};

export function ValidationSummary({ total, valid, failed }: ValidationSummaryProps) {
  return (
    <div className="panel__summary" aria-label="Validation summary">
      <div className="summary-stat">
        <span className="summary-stat__label">Total records</span>
        <strong className="summary-stat__value">{total}</strong>
      </div>
      <div className="summary-stat summary-stat--success">
        <span className="summary-stat__label">Valid records</span>
        <strong className="summary-stat__value">{valid}</strong>
      </div>
      <div className="summary-stat summary-stat--failure">
        <span className="summary-stat__label">Failed records</span>
        <strong className="summary-stat__value">{failed}</strong>
      </div>
    </div>
  );
}
