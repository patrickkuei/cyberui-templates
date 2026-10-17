import type { SectionId } from '../sections';

/**
 * Scrolls a section into view and moves keyboard focus to it, so the next Tab
 * continues from the section instead of from the nav link that was clicked.
 *
 * It never writes window.location.hash. That is deliberate: this page runs
 * inside the site's preview iframe and may be deployed under any subpath, and a
 * hash change there can fight the host page's router and puts a #fragment in
 * the address bar that a reload would jump to. Page-internal links in this
 * template therefore call this function instead of relying on href="#id".
 *
 * Smooth scrolling only answers a click, never page load, and is replaced by an
 * instant jump when the person asked their system for less motion.
 */
export function scrollToSection(id: SectionId, reducedMotion: boolean): void {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  target.focus({ preventScroll: true });
}
