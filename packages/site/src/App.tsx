import { CyberNotificationProvider } from 'cyberui-2045';
import { useHashRoute, type Route } from './router/useHashRoute';
import { useScrollToTopOnChange } from './hooks/useScrollToTopOnChange';
import { HomePage } from './pages/HomePage';
import { TemplatesPage } from './pages/TemplatesPage';
import { ProcessPage } from './pages/ProcessPage';
import { Nav } from './components/Nav';
import './App.css';

// Exhaustive switch on route.name (rather than a ternary chain) so that
// adding a new Route variant in useHashRoute.ts without wiring a case here
// is a compile error, not a silent fallback to Home — same pattern this
// codebase's own /process page (Act 1, "Information Architecture") and the
// monitoring template's case study hold up as best practice.
function renderRoute(route: Route) {
  switch (route.name) {
    case 'templates':
      return <TemplatesPage openSlug={route.openSlug} />;
    case 'process':
      return <ProcessPage />;
    case 'home':
      return <HomePage />;
    case 'not-found':
      // v0: an unrecognized hash falls back to Home.
      return <HomePage />;
    default: {
      const _exhaustive: never = route;
      return _exhaustive;
    }
    // ^ if this doesn't compile, a new Route variant was added without a
    // case above — that's the point.
  }
}

export default function App() {
  const route = useHashRoute();
  // Keyed on the page, not the whole route: opening a preview on /templates is a hash change too.
  useScrollToTopOnChange(route.name);

  return (
    // The provider is for the toasts (the Templates page's "Copied"). top-right, not
    // bottom-*: the library lays toasts out with absolutely positioned children, so
    // at a bottom edge they start on the edge and fall off-screen (cyberui-2045 v2.6.0).
    <CyberNotificationProvider position="top-right">
      <Nav transparentUntilScroll={route.name === 'home'} />
      <main className="shell">{renderRoute(route)}</main>
    </CyberNotificationProvider>
  );
}
