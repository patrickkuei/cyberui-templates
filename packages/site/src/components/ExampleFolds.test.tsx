import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExampleFolds } from './ExampleFolds';
import { TEMPLATE_CONTENT } from '../content/templateContent';

const examples = TEMPLATE_CONTENT.monitoring!.examples;

describe('ExampleFolds', () => {
  it('says once that the examples come from a simulated interview', () => {
    render(<ExampleFolds examples={examples} />);
    expect(screen.getAllByText(/simulated interview/)).toHaveLength(1);
  });

  it('renders one folded item per example, closed to start', () => {
    render(<ExampleFolds examples={examples} />);
    const shop = screen.getByRole('button', { name: /A small shop owner/ });
    const api = screen.getByRole('button', { name: /An LLM API developer/ });
    expect(shop).toHaveAttribute('aria-expanded', 'false');
    expect(api).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens one fold without closing the other', async () => {
    render(<ExampleFolds examples={examples} />);
    const shop = screen.getByRole('button', { name: /A small shop owner/ });
    const api = screen.getByRole('button', { name: /An LLM API developer/ });
    await userEvent.click(shop);
    await userEvent.click(api);
    expect(shop).toHaveAttribute('aria-expanded', 'true');
    expect(api).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows the requests in order, then where they got stuck and how they would know', async () => {
    render(<ExampleFolds examples={examples} />);
    const header = screen.getByRole('button', { name: /A small shop owner/ });
    await userEvent.click(header);
    // Closed Accordion panels stay in the DOM (inert), so scope to this fold's panel.
    const panel = document.getElementById(header.getAttribute('aria-controls')!)!;
    const requests = within(panel).getAllByRole('listitem');
    expect(requests).toHaveLength(5);
    expect(requests[0]).toHaveTextContent('Change the app name and all the text from AI monitoring to my shop.');
    expect(within(panel).getByText(/Step 3 is the hard one/)).toBeInTheDocument();
    expect(within(panel).getByText(/I'm done when I open it/)).toBeInTheDocument();
  });

  it('gives two renders on one page different ids', () => {
    render(
      <>
        <ExampleFolds examples={examples} />
        <ExampleFolds examples={examples} />
      </>
    );
    const ids = screen.getAllByRole('button', { name: /A small shop owner/ }).map((button) => button.id);
    expect(new Set(ids).size).toBe(2);
  });
});
