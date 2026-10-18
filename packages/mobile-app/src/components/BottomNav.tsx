import { ROUTE_TITLES } from '../data/product';
import { TAB_ICONS } from '../icons';
import { TAB_ROUTES, type Route } from '../router/useHashRoute';

// cyberui-2045 has no bottom navigation (its TabNavigation is a strip along the
// top; a bottom bar is an open feature request, patrickkuei/CyberUI#131), so
// this is hand-built from plain links and
// App.css. They are real <a href="#/..."> links, so the browser's Back and
// Forward buttons, a long-press and "copy link" all work, and the current tab
// is marked with aria-current for screen readers. Three tabs, not five: more
// than that stops fitting a 320px screen with 44px targets and readable labels.
// A pushed screen (a device's page, Add device) marks none and hides the bar.
export function BottomNav({ route, onNavigate }: { route: Route; onNavigate?: () => void }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {TAB_ROUTES.map((tab) => {
        const Icon = TAB_ICONS[tab];
        return (
          <a key={tab} href={`#/${tab}`} className="nav-tab" aria-current={route === tab ? 'page' : undefined} onClick={onNavigate}>
            <Icon />
            <span>{ROUTE_TITLES[tab]}</span>
          </a>
        );
      })}
    </nav>
  );
}
