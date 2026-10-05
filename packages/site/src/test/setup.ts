import '@testing-library/jest-dom/vitest';

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// cyberui-2045's TabNavigation measures its container to pick a responsive
// mode (scroll/wrap/dropdown); jsdom/happy-dom never perform real layout, so
// without these stubs it renders nothing to interact with in tests.
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

Object.defineProperties(HTMLElement.prototype, {
  offsetWidth: { configurable: true, value: 1024 },
  offsetHeight: { configurable: true, value: 48 },
});

// cyberui-2045's toast measures itself with scrollWidth in a ref callback and
// re-measures while the result is falsy. happy-dom never lays out, so
// scrollWidth is 0 and the toast would update state forever ("Maximum update
// depth exceeded"). A real browser always returns a width.
Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, value: 240 });
