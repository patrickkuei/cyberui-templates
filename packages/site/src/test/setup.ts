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

// cyberui-2045 checks for its stylesheet at import time by reading
// --color-primary from document.documentElement and warns "Stylesheet not
// detected" when it is missing. Tests do not load CSS, so provide the token
// inline (setup runs before any test module imports cyberui-2045).
document.documentElement.style.setProperty('--color-primary', '#ff005d');

// vite.config.ts turns off iframe page loading (the preview's build does not
// exist under the test server). happy-dom then reports each iframe it declines
// to load through console.error. That report is expected here, so drop that one
// message and let every other console.error through.
const reportError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  if (args.some((arg) => String(arg).includes('Iframe page loading is disabled'))) return;
  reportError(...args);
};
