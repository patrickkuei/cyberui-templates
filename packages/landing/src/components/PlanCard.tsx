import { Badge, Button, Card } from 'cyberui-2045';
import { formatPrice, priceCaption, type BillingPeriod, type Plan } from '../data/plans';
import { CheckIcon } from '../icons';

interface PlanCardProps {
  plan: Plan;
  period: BillingPeriod;
  onSelect: () => void;
}

// The name is our own <h3> (not Card's `title` prop) so the "Most popular" tag
// can sit beside it. Card renders an <h3> only when `title` is given, so this
// does not make two. The highlighted plan gets Card's `accent` variant: the
// glowing border is the whole emphasis, and no other card on the page has it.
export function PlanCard({ plan, period, onSelect }: PlanCardProps) {
  return (
    <Card variant={plan.highlighted ? 'accent' : 'default'} className="card-surface plan-card">
      <div className="plan-head">
        <h3 className="plan-name">{plan.name}</h3>
        {plan.highlighted ? (
          <Badge variant="accent" size="sm">
            Most popular
          </Badge>
        ) : null}
      </div>
      <p className="plan-blurb">{plan.blurb}</p>
      <p className="plan-price">
        <span className="plan-amount">{formatPrice(plan.price[period])}</span>
        <span className="plan-unit"> /month</span>
      </p>
      <p className="plan-caption">{priceCaption(plan, period)}</p>
      <ul className="plan-features">
        {plan.features.map((feature) => (
          <li key={feature}>
            <span className="plan-check">
              <CheckIcon />
            </span>
            {feature}
          </li>
        ))}
      </ul>
      <Button className="plan-cta" variant={plan.highlighted ? 'primary' : 'secondary'} onClick={onSelect}>
        {plan.cta}
      </Button>
    </Card>
  );
}
