import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplatePreview } from './TemplatePreview';
import { getTemplate } from '../data/templates';

const monitoring = getTemplate('monitoring')!;

describe('TemplatePreview', () => {
  it('shows the live preview iframe by default', () => {
    render(<TemplatePreview template={monitoring} />);
    const frame = screen.getByTitle('AI Product Monitoring live preview');
    expect(frame).toHaveAttribute('src', './live/monitoring/index.html');
  });

  it('shows a loading state until the iframe has loaded', () => {
    render(<TemplatePreview template={monitoring} />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading the live demo');
    fireEvent.load(screen.getByTitle('AI Product Monitoring live preview'));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('switches to the Code tab, hiding the iframe without unmounting it (no reload on the way back)', async () => {
    render(<TemplatePreview template={monitoring} />);
    const frame = screen.getByTitle('AI Product Monitoring live preview', { exact: true });
    await userEvent.click(screen.getByRole('tab', { name: 'Code' }));
    expect(screen.getByText('Bounded random walk — src/data/simulation.ts')).toBeVisible();
    expect(frame).not.toBeVisible();
    await userEvent.click(screen.getByRole('tab', { name: 'Live preview' }));
    expect(screen.getByTitle('AI Product Monitoring live preview')).toBe(frame);
    expect(frame).toBeVisible();
  });
});
