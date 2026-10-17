import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scrollToSection } from './scrollToSection';

describe('scrollToSection', () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    // happy-dom has no layout, so there is nothing to scroll: record the call instead.
    Element.prototype.scrollIntoView = scrollIntoView;
    document.body.innerHTML = '<section id="pricing" tabindex="-1">Pricing</section>';
    window.location.hash = '';
    scrollIntoView.mockClear();
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('scrolls the section smoothly and focuses it', () => {
    scrollToSection('pricing', false);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('pricing'));
    expect(document.getElementById('pricing')).toHaveFocus();
  });

  it('jumps instead of animating under prefers-reduced-motion', () => {
    scrollToSection('pricing', true);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
  });

  it('leaves location.hash alone', () => {
    scrollToSection('pricing', false);
    expect(window.location.hash).toBe('');
  });

  it('does nothing, and does not throw, when the section is not on the page', () => {
    expect(() => scrollToSection('faq', false)).not.toThrow();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
