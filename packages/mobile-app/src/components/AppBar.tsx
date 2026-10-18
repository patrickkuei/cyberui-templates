import { Badge } from 'cyberui-2045';
import { DEMO_BADGE, PRODUCT_NAME } from '../data/product';
import { BackIcon } from '../icons';

/**
 * The bar at the top of every screen: the app's name and the "Demo" badge, the
 * template's one persistent signal that nothing here is real (the full sentence
 * is in Settings and in the pairing confirmation). Pass onBack on a screen that
 * was pushed on top of another, and a Back button appears.
 */
export function AppBar({ onBack }: { onBack?: () => void }) {
  return (
    <header className="app-bar">
      {onBack && (
        <button type="button" className="app-bar-back" onClick={onBack}>
          <BackIcon />
          <span>Back</span>
        </button>
      )}
      <span className="app-bar-name">{PRODUCT_NAME}</span>
      <Badge variant="neutral" size="sm" shape="rounded" shadow={false}>
        {DEMO_BADGE}
      </Badge>
    </header>
  );
}
