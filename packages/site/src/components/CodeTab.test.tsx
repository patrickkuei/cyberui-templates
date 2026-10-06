import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { CodeTab, folderTree } from './CodeTab';
import { contentFor } from '../content/templateContent';

const code = contentFor('monitoring').code;

describe('folderTree', () => {
  it('draws the shared parent as the root and the folders as aligned branches', () => {
    const tree = folderTree([
      { path: 'src/a', purpose: 'First.' },
      { path: 'src/longer', purpose: 'Second.' },
    ]);
    expect(tree).toBe(['src/', '├── a       First.', '└── longer  Second.'].join('\n'));
  });
});

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

  it('points to How we design for the reasoning behind the principles', () => {
    render(<CodeTab content={code} />);
    expect(screen.getByRole('link', { name: 'How we design' })).toHaveAttribute('href', '#/process');
  });

  it('keeps each explanation to a single short sentence', () => {
    for (const principle of code.principles) {
      expect(principle.detail.length).toBeLessThanOrEqual(60);
      expect(principle.detail.endsWith('.')).toBe(true);
    }
  });

  it('links to nothing but How we design: the code is shown, not linked to', () => {
    render(<CodeTab content={code} />);
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(['#/process']);
  });

  it('draws the folder map as a tree with every folder and its purpose', () => {
    render(<CodeTab content={code} />);
    const section = screen.getByRole('heading', { name: 'Folder map' }).closest('section')!;
    const tree = section.querySelector('pre')!.textContent!;
    expect(tree.startsWith('src/\n')).toBe(true);
    expect(tree.split('\n')).toHaveLength(code.folders.length + 1);
    expect(tree).toContain('└── ');
    expect(tree).toMatch(/data\s+Simulation, limits, the data hook\. Your data goes here\./);
  });
});
