// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RecordFilterSelect } from './RecordFilterSelect';

afterEach(() => {
  cleanup();
});

describe('RecordFilterSelect', () => {
  it('renders filter options with their counts', () => {
    render(
      <RecordFilterSelect
        value="all"
        counts={{ all: 20, mismatch: 2, duplicate: 2 }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('option', { name: 'All records (20)' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Mismatches (2)' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Duplicates (2)' })).toBeTruthy();
  });

  it('notifies the parent when the selected filter changes', () => {
    const onChange = vi.fn();
    render(
      <RecordFilterSelect
        value="all"
        counts={{ all: 20, mismatch: 2, duplicate: 2 }}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'mismatch' } });

    expect(onChange).toHaveBeenCalledWith('mismatch');
  });
});
