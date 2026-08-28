// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LoadingState } from './LoadingState';

afterEach(() => {
  cleanup();
});

describe('LoadingState', () => {
  it('renders the loading message and spinner', () => {
    const { container } = render(<LoadingState />);

    expect(screen.getByText('Loading merged records…')).toBeTruthy();
    expect(container.querySelector('.loading__spinner')).toBeTruthy();
  });
});
