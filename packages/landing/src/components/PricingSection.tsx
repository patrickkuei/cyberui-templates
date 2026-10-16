import { useState } from 'react';
import { Badge, Toggle } from 'cyberui-2045';
import { PLANS, YEARLY_SAVING_PCT, type BillingPeriod } from '../data/plans';
import { sectionProps, type SectionProps } from '../sections';
import { PlanCard } from './PlanCard';
import { SectionHeading } from './SectionHeading';

export function PricingSection({ goTo }: SectionProps) {
  const [period, setPeriod] = useState<BillingPeriod>('monthly');

  return (
    <section {...sectionProps('pricing')} className="section">
      <div className="page-width">
        <SectionHeading id="pricing" />
        <div className="billing-switch">
          {/*
            Toggle only connects its visible label to the switch when it is
            given an `id`, so the id is not optional: without it the switch has
            no accessible name (patrickkuei/CyberUI#120). role="switch" because it is an on/off setting,
            not a choice to submit; onChange receives the new boolean.
          */}
          <Toggle
            id="billing-period"
            role="switch"
            label="Bill yearly"
            checked={period === 'yearly'}
            onChange={(yearly) => setPeriod(yearly ? 'yearly' : 'monthly')}
          />
          <Badge variant="success" size="sm">
            Save {YEARLY_SAVING_PCT}%
          </Badge>
        </div>
        <ul className="plan-grid">
          {PLANS.map((plan) => (
            <li key={plan.id}>
              {/* MOCK: every plan button just scrolls to the signup form. A real page links to checkout, or to your sales contact for the top tier. */}
              <PlanCard plan={plan} period={period} onSelect={() => goTo('signup')} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
