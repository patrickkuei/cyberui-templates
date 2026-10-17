// Plans are data, not JSX, so changing a price or adding a plan never touches a
// component. The numbers are fiction.
//
// MOCK: nothing here is wired to billing. The plan buttons (see PricingSection)
// only scroll to the signup form. A real page would link each plan to checkout
// (and the top tier to your sales contact), and read prices from your billing
// provider instead of this file.

export type BillingPeriod = 'monthly' | 'yearly';

export interface Plan {
  id: string;
  name: string;
  blurb: string;
  /**
   * Price per month, in dollars, for each billing period. A Record over
   * BillingPeriod, not two fields: adding a period to the union is a compile
   * error until every plan has a price for it.
   */
  price: Record<BillingPeriod, number>;
  features: string[];
  cta: string;
  /** The plan the page steers people to. Exactly one plan is highlighted (plans.test.ts). */
  highlighted: boolean;
}

/** The saving the "Save 20%" tag advertises. plans.test.ts checks every paid plan really gives it. */
export const YEARLY_SAVING_PCT = 20;

export const PLANS: Plan[] = [
  {
    id: 'hobby',
    name: 'Hobby',
    blurb: 'For side projects and learning.',
    price: { monthly: 0, yearly: 0 },
    features: ['1 project', '100 GB bandwidth', 'Community support'],
    cta: 'Get started',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    blurb: 'For products with real users.',
    price: { monthly: 25, yearly: 20 },
    features: ['Unlimited projects', '1 TB bandwidth', 'Preview deployments', 'Email support'],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    id: 'team',
    name: 'Team',
    blurb: 'For teams that need control.',
    price: { monthly: 75, yearly: 60 },
    features: ['Everything in Pro', 'Roles and audit log', 'Single sign-on', 'Priority support'],
    cta: 'Contact sales',
    highlighted: false,
  },
];

export function formatPrice(dollars: number): string {
  return `$${dollars}`;
}

// Record over BillingPeriod for the same reason as Plan.price: a new period
// must say how it is billed.
const CAPTION: Record<BillingPeriod, (monthlyPrice: number) => string> = {
  monthly: () => 'billed monthly',
  yearly: (monthlyPrice) => `billed ${formatPrice(monthlyPrice * 12)} yearly`,
};

/** The line under a plan's price, e.g. "billed $240 yearly". Free plans say so instead. */
export function priceCaption(plan: Plan, period: BillingPeriod): string {
  const price = plan.price[period];
  return price === 0 ? 'free, no card needed' : CAPTION[period](price);
}
