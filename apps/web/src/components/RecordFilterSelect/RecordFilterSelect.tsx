import type { RecordFilter } from '../../types';

type RecordFilterSelectProps = {
  value: RecordFilter;
  counts: {
    all: number;
    mismatch: number;
    duplicate: number;
  };
  onChange: (filter: RecordFilter) => void;
};

export function RecordFilterSelect({ value, counts, onChange }: RecordFilterSelectProps) {
  return (
    <div className="filter-bar" role="group" aria-label="Filter records">
      <label className="filter-bar__label" htmlFor="record-filter">Filter results</label>
      <select
        className="filter-bar__select"
        id="record-filter"
        value={value}
        onChange={(event) => {
          const nextFilter = event.target.value;

          if (nextFilter === 'all' || nextFilter === 'mismatch' || nextFilter === 'duplicate') {
            onChange(nextFilter);
          }
        }}
      >
        <option value="all">All records ({counts.all})</option>
        <option value="mismatch">Mismatches ({counts.mismatch})</option>
        <option value="duplicate">Duplicates ({counts.duplicate})</option>
      </select>
    </div>
  );
}
