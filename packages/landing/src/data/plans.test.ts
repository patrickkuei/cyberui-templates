import { describe, it, expect } from 'vitest';
import { PLANS, YEARLY_SAVING_PCT, formatPrice, priceCaption, type BillingPeriod } from './plans';

// The union is the source of truth; listing it here makes a new period fail this
// test until its prices and caption exist (the Record types catch it at compile time too).
const PERIODS: BillingPeriod[] = ['monthly', 'yearly'];

describe('plans', () => {
  it('gives every plan a price for every billing period', () => {
    for (const plan of PLANS) {
      for (const period of PERIODS) {
        expect(plan.price[period], `${plan.id} has no ${period} price`).toBeTypeOf('number');
      }
    }
  });

  it('highlights exactly one plan', () => {
    expect(PLANS.filter((plan) => plan.highlighted)).toHaveLength(1);
  });

  it('has distinct ids, and each plan lists features', () => {
    expect(new Set(PLANS.map((plan) => plan.id)).size).toBe(PLANS.length);
    for (const plan of PLANS) expect(plan.features.length).toBeGreaterThan(0);
  });

  it('makes the advertised yearly saving true for every paid plan', () => {
    for (const plan of PLANS.filter((p) => p.price.monthly > 0)) {
      const saving = Math.round((1 - plan.price.yearly / plan.price.monthly) * 100);
      expect(saving, `${plan.id} saves ${saving}%, not ${YEARLY_SAVING_PCT}%`).toBe(YEARLY_SAVING_PCT);
    }
  });

  it('formats prices and captions', () => {
    const pro = PLANS.find((plan) => plan.id === 'pro')!;
    expect(formatPrice(pro.price.yearly)).toBe('$20');
    expect(priceCaption(pro, 'monthly')).toBe('billed monthly');
    expect(priceCaption(pro, 'yearly')).toBe('billed $240 yearly');
    expect(priceCaption(PLANS[0]!, 'yearly')).toBe('free, no card needed');
  });
});
