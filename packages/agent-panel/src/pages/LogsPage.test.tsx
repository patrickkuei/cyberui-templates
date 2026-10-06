import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LogsPage } from './LogsPage';

describe('LogsPage', () => {
  it('has a title and says the sessions are fixed samples', () => {
    render(<LogsPage now={1_000_000_000} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Logs' })).toBeInTheDocument();
    expect(screen.getByText('Sample sessions. These are fixed examples; wire in your own history.')).toBeInTheDocument();
  });

  it('shows the past sessions table with its Export transcript mock', () => {
    render(<LogsPage now={1_000_000_000} />);
    expect(screen.getByRole('table', { name: 'Past sessions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export transcript' })).toBeInTheDocument();
  });
});
