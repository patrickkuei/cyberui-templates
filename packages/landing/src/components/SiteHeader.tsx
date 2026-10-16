import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Button, Drawer } from 'cyberui-2045';
import { HERO, NAV_ITEMS, PRODUCT_NAME } from '../data/product';
import type { SectionId } from '../sections';

interface SiteHeaderProps {
  goTo: (id: SectionId) => void;
}

export function SiteHeader({ goTo }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pendingSection = useRef<SectionId | null>(null);

  // Scroll only after the Drawer has unmounted. While it is open the library
  // locks the page's scroll (body overflow: hidden) and puts focus inside the
  // dialog; this effect runs after both have been undone, so the scroll lands
  // and goTo's focus() is not overwritten by the Drawer closing.
  useEffect(() => {
    if (!menuOpen && pendingSection.current) {
      const id = pendingSection.current;
      pendingSection.current = null;
      goTo(id);
    }
  }, [menuOpen, goTo]);

  // These are <a href="#id"> for the semantics (a link to a place on the page),
  // but the click is intercepted: following the href would rewrite
  // location.hash, which this template never does (see utils/scrollToSection.ts).
  const onNavClick = (id: SectionId) => (event: MouseEvent) => {
    event.preventDefault();
    goTo(id);
  };
  const chooseFromMenu = (id: SectionId) => {
    pendingSection.current = id;
    setMenuOpen(false);
  };
  const onMenuLinkClick = (id: SectionId) => (event: MouseEvent) => {
    event.preventDefault();
    chooseFromMenu(id);
  };

  // Drawer is aria-modal but does not trap Tab, so a keyboard user can tab out
  // of the open menu into the page behind it (patrickkuei/CyberUI#123). This
  // template does not work around that; Escape and the close button still work.
  return (
    <header className="site-header">
      <div className="site-header-inner page-width">
        <a className="wordmark" href="#hero" onClick={onNavClick('hero')}>
          {PRODUCT_NAME}
        </a>
        <nav className="site-nav" aria-label="Primary">
          {NAV_ITEMS.map(({ id, label }) => (
            <a key={id} className="site-nav-link" href={`#${id}`} onClick={onNavClick(id)}>
              {label}
            </a>
          ))}
        </nav>
        <div className="site-header-actions">
          {/* MOCK: scrolls to the signup form. A real page would start a trial or go to your sign-up route. */}
          <Button className="header-cta" size="sm" onClick={() => goTo('signup')}>
            {HERO.primaryCta}
          </Button>
          {/* Below md the links move into a Drawer; CSS hides this button from md up. */}
          <Button
            className="menu-button"
            variant="ghost"
            size="sm"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            Menu
          </Button>
        </div>
      </div>
      <Drawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" side="right" size="sm">
        <nav className="drawer-nav" aria-label="Mobile">
          {NAV_ITEMS.map(({ id, label }) => (
            <a key={id} className="site-nav-link" href={`#${id}`} onClick={onMenuLinkClick(id)}>
              {label}
            </a>
          ))}
          <Button onClick={() => chooseFromMenu('signup')}>{HERO.primaryCta}</Button>
        </nav>
      </Drawer>
    </header>
  );
}
