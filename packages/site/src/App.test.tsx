import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the home page by default', () => {
    window.location.hash = '';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Built by AI.');
  });

  it('renders the templates page with its preview open for a known template hash', () => {
    window.location.hash = '#/templates/monitoring';
    render(<App />);
    expect(screen.getByTitle('AI Product Monitoring live preview')).toBeInTheDocument();
  });

  it('renders the nav solid immediately on non-home routes (Review Focus #3)', () => {
    window.location.hash = '#/templates/monitoring';
    render(<App />);
    expect(screen.getByRole('navigation')).toHaveClass('site-nav-solid');
  });

  it('renders the nav transparent over the hero on Home, until scrolled', () => {
    window.location.hash = '';
    render(<App />);
    expect(screen.getByRole('navigation')).not.toHaveClass('site-nav-solid');
  });

  it('renders the templates page for #/templates, with no preview open', () => {
    window.location.hash = '#/templates';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Templates' })).toBeInTheDocument();
    expect(screen.queryByTitle('AI Product Monitoring live preview')).not.toBeInTheDocument();
  });

  it('renders the process page for #/process', () => {
    window.location.hash = '#/process';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'How we design' })).toBeInTheDocument();
  });
});
