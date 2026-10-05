import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('switches to the Code tab, which replaces the iframe', async () => {
    render(<TemplatePreview template={monitoring} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Code' }));
    expect(screen.getByText('Bounded random walk — src/data/simulation.ts')).toBeInTheDocument();
    expect(screen.queryByTitle('AI Product Monitoring live preview')).not.toBeInTheDocument();
  });
});
