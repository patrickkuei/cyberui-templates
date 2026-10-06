import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

it('renders', () => {
  render(<App />);
  expect(screen.getByText('Agent Control Panel')).toBeInTheDocument();
});
