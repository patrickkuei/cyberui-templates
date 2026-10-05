import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { CodeTab } from './CodeTab';
import { contentFor } from '../content/templateContent';

const code = contentFor('monitoring').code;

describe('CodeTab', () => {
  it('shows every principle with one short line, its file, and a real excerpt', () => {
    const { container } = render(<CodeTab content={code} />);
    const figures = container.querySelectorAll('figure');
    expect(figures).toHaveLength(code.principles.length);
    const first = within(figures[0] as HTMLElement);
    expect(first.getByText('Single source of truth')).toBeInTheDocument();
    expect(first.getByText('src/data/thresholds.ts')).toBeInTheDocument();
    expect(figures[0]!.querySelector('pre')!.textContent).toBe(code.principles[0]!.excerpt.join('\n'));
  });

  it('keeps each explanation to a single short sentence', () => {
    for (const principle of code.principles) {
      expect(principle.detail.length).toBeLessThanOrEqual(60);
      expect(principle.detail.endsWith('.')).toBe(true);
    }
  });

  it('has no links: the code is shown, not linked to', () => {
    render(<CodeTab content={code} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('maps every folder to its purpose, and says the data folder is where your data goes', () => {
    render(<CodeTab content={code} />);
    const folders = screen.getByRole('heading', { name: "What's where" }).closest('section')!;
    expect(within(folders).getAllByRole('listitem')).toHaveLength(code.folders.length);
    expect(within(folders).getByText(/Your data goes here/)).toBeInTheDocument();
  });
});
