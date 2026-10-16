import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PLANS } from '../data/plans';
import { PlanCard } from './PlanCard';

const pro = PLANS.find((plan) => plan.highlighted)!;
const hobby = PLANS.find((plan) => !plan.highlighted)!;

describe('PlanCard', () => {
  it('shows the price and caption for the billing period it is given', () => {
    const { rerender } = render(<PlanCard plan={pro} period="monthly" onSelect={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 3, name: pro.name })).toBeInTheDocument();
    expect(screen.getByText('$25')).toBeInTheDocument();
    expect(screen.getByText('billed monthly')).toBeInTheDocument();
    rerender(<PlanCard plan={pro} period="yearly" onSelect={vi.fn()} />);
    expect(screen.getByText('$20')).toBeInTheDocument();
    expect(screen.getByText('billed $240 yearly')).toBeInTheDocument();
  });

  it('lists every feature of the plan', () => {
    render(<PlanCard plan={pro} period="monthly" onSelect={vi.fn()} />);
    for (const feature of pro.features) expect(screen.getByText(feature)).toBeInTheDocument();
  });

  it('tags only the highlighted plan "Most popular"', () => {
    const { unmount } = render(<PlanCard plan={pro} period="monthly" onSelect={vi.fn()} />);
    expect(screen.getByText('Most popular')).toBeInTheDocument();
    unmount();
    render(<PlanCard plan={hobby} period="monthly" onSelect={vi.fn()} />);
    expect(screen.queryByText('Most popular')).not.toBeInTheDocument();
  });

  it('calls onSelect from its button (the page decides what that does)', async () => {
    const onSelect = vi.fn();
    render(<PlanCard plan={pro} period="monthly" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: pro.cta }));
    expect(onSelect).toHaveBeenCalledOnce();
  });
});
