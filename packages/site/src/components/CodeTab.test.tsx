import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { CodeTab } from './CodeTab';
import { contentFor } from '../content/templateContent';

const code = contentFor('monitoring').code;

describe('CodeTab', () => {
  it('lists every principle with its explanation', () => {
    render(<CodeTab slug="monitoring" content={code} />);
    for (const principle of code.principles) {
      expect(screen.getByText(principle.name)).toBeInTheDocument();
    }
    expect(screen.getByText(/Alarm limits live in one file/)).toBeInTheDocument();
  });

  it('links each principle to real source files on GitHub, in a new tab', () => {
    render(<CodeTab slug="monitoring" content={code} />);
    const link = screen.getByRole('link', { name: /thresholds\.ts/ });
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/patrickkuei/cyberui-templates/blob/main/packages/monitoring/src/data/thresholds.ts'
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
  });

  it('maps every folder to its purpose, and says the data folder is where your data goes', () => {
    render(<CodeTab slug="monitoring" content={code} />);
    const folders = screen.getByRole('heading', { name: "What's where" }).closest('section')!;
    const items = within(folders).getAllByRole('listitem');
    expect(items).toHaveLength(code.folders.length);
    expect(within(folders).getByText(/Your data goes here/)).toBeInTheDocument();
  });

  it('shows no source code blocks: the tab links to code instead of quoting it', () => {
    const { container } = render(<CodeTab slug="monitoring" content={code} />);
    expect(container.querySelector('pre')).toBeNull();
  });
});
