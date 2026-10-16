// src/App.test.tsx (replaced in Task 10)
import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

it('renders', () => {
  render(<App />);
  expect(screen.getByText('Tessera')).toBeInTheDocument();
});
