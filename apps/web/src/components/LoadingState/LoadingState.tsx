export function LoadingState() {
  return (
    <div className="loading">
      <span className="loading__spinner" aria-hidden="true" />
      <span>Loading merged records…</span>
    </div>
  );
}
