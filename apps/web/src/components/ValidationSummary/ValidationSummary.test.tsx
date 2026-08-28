// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ValidationSummary } from './ValidationSummary';

afterEach(() => {
  cleanup();
});

describe('ValidationSummary', () => {
  it('renders the total, valid, and failed record counts', () => {
    render(<ValidationSummary total={20} valid={16} failed={4} />);

    expect(screen.getByText('Total records')).toBeTruthy();
    expect(screen.getByText('20')).toBeTruthy();
    expect(screen.getByText('Valid records')).toBeTruthy();
    expect(screen.getByText('16')).toBeTruthy();
    expect(screen.getByText('Failed records')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
  });
});
