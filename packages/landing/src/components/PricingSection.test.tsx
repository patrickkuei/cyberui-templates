import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PricingSection } from './PricingSection';

// Each plan is a list item named by its h3, so queries scope to one plan's card.
function planCard(name: string): HTMLElement {
  return screen.getByRole('heading', { level: 3, name }).closest('li')!;
}

describe('PricingSection', () => {
  it('starts on monthly billing with the switch off', () => {
    render(<PricingSection goTo={vi.fn()} />);
    expect(screen.getByRole('switch', { name: 'Bill yearly' })).not.toBeChecked();
    expect(within(planCard('Hobby')).getByText('$0')).toBeInTheDocument();
    expect(within(planCard('Pro')).getByText('$25')).toBeInTheDocument();
    expect(within(planCard('Team')).getByText('$75')).toBeInTheDocument();
    expect(within(planCard('Pro')).getByText('billed monthly')).toBeInTheDocument();
  });

  it('switches every price and caption to yearly, and back', async () => {
    render(<PricingSection goTo={vi.fn()} />);
    const toggle = screen.getByRole('switch', { name: 'Bill yearly' });
    await userEvent.click(toggle);
    expect(toggle).toBeChecked();
    expect(within(planCard('Hobby')).getByText('$0')).toBeInTheDocument();
    expect(within(planCard('Hobby')).getByText('free, no card needed')).toBeInTheDocument();
    expect(within(planCard('Pro')).getByText('$20')).toBeInTheDocument();
    expect(within(planCard('Pro')).getByText('billed $240 yearly')).toBeInTheDocument();
    expect(within(planCard('Team')).getByText('$60')).toBeInTheDocument();
    expect(within(planCard('Team')).getByText('billed $720 yearly')).toBeInTheDocument();

    await userEvent.click(toggle);
    expect(toggle).not.toBeChecked();
    expect(within(planCard('Pro')).getByText('$25')).toBeInTheDocument();
  });

  it('advertises the saving and keeps the highlighted plan highlighted in both periods', async () => {
    render(<PricingSection goTo={vi.fn()} />);
    expect(screen.getByText('Save 20%')).toBeInTheDocument();
    expect(screen.getAllByText('Most popular')).toHaveLength(1);
    expect(within(planCard('Pro')).getByText('Most popular')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('switch', { name: 'Bill yearly' }));
    expect(screen.getAllByText('Most popular')).toHaveLength(1);
    expect(within(planCard('Pro')).getByText('Most popular')).toBeInTheDocument();
  });

  it('sends every plan button to the signup form (they are mock)', async () => {
    const goTo = vi.fn();
    render(<PricingSection goTo={goTo} />);
    await userEvent.click(within(planCard('Hobby')).getByRole('button', { name: 'Get started' }));
    await userEvent.click(within(planCard('Pro')).getByRole('button', { name: 'Start free trial' }));
    await userEvent.click(within(planCard('Team')).getByRole('button', { name: 'Contact sales' }));
    expect(goTo.mock.calls).toEqual([['signup'], ['signup'], ['signup']]);
  });
});
