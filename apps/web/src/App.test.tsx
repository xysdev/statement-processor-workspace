// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { StatementRecord } from '@statement/shared';
import App from './App';
import { useStatementReport } from './hooks/useStatementReport';

vi.mock('./hooks/useStatementReport', () => ({
  useStatementReport: vi.fn(),
}));

const records: StatementRecord[] = [
  {
    reference: '1001',
    accountNumber: 'NL01',
    description: 'Payment',
    startBalance: '10.00',
    mutation: '+2.00',
    endBalance: '12.00',
    source: 'csv',
  },
];

const renderWithReport = () => {
  vi.mocked(useStatementReport).mockReturnValue({
    records,
    failedRecords: [],
    filteredRecords: records,
    validRecordCount: 1,
    filterCounts: { all: 1, mismatch: 0, duplicate: 0 },
    activeFilter: 'all',
    setActiveFilter: vi.fn(),
    isLoading: false,
    error: null,
    uploadRecords: vi.fn(),
  });

  render(<App />);
};

describe('App', () => {
  it('hides the upload form after records are available and shows upload again', () => {
    renderWithReport();

    expect(screen.queryByText('Upload statement files')).toBeNull();
    expect(screen.getByText('Validation results')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Export PDF' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Upload again' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Upload again' }));

    expect(screen.getByText('Upload statement files')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Export PDF' })).toBeNull();
  });
});
