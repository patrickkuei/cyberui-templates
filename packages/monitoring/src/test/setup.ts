import '@testing-library/jest-dom/vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { configure } from '@testing-library/react';

// vite-node provides __dirname; it is not in this project's types (only
// vite/client is), so declare it.
declare const __dirname: string;

// The components size their chart bodies with CSS classes (no inline styles),
// and tests do not otherwise load CSS. Take the `.chart-body` rules out of the
// real stylesheet and inject them, so getComputedStyle sees the real heights
// with no second copy of those numbers to keep in step. (happy-dom drops rules
// it cannot parse from the whole of App.css, so the stylesheet is not injected
// whole. Only top-level rules, starting at column 0, are taken: a .chart-body
// rule inside an @media block is not, and the layout approximation below has
// no breakpoints anyway.)
function topLevelRules(css: string, prefix: string): string[] {
  const lines = css.replace(/\r\n/g, '\n').split('\n');
  const rules: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i]!.startsWith(prefix)) continue;
    const block: string[] = [];
    let depth = 0;
    for (; i < lines.length; i++) {
      const line = lines[i]!;
      block.push(line);
      depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
      if (depth <= 0) break;
    }
    rules.push(block.join('\n'));
  }
  return rules;
}

const chartBodyRules = topLevelRules(readFileSync(resolve(__dirname, '../App.css'), 'utf8'), '.chart-body');
if (chartBodyRules.length === 0) throw new Error('No .chart-body rules found in App.css; the chart tests need them.');
const appStyle = document.createElement('style');
appStyle.textContent = chartBodyRules.join('\n');
document.head.appendChild(appStyle);

// cyberui-2045 checks for its stylesheet at import time by reading
// --color-primary from document.documentElement and warns "Stylesheet not
// detected" when it's missing. Tests don't load CSS, so provide the token
// inline (setup runs before any test module imports cyberui-2045).
document.documentElement.style.setProperty('--color-primary', '#ff005d');

// Recharts 3's <ResponsiveContainer> seeds its size from
// `containerRef.current.getBoundingClientRect()` on mount, then updates it
// from ResizeObserver `contentRect`s (see
// node_modules/recharts/es6/component/ResponsiveContainer.js). happy-dom has
// no layout engine: getBoundingClientRect() always returns an all-zero
// DOMRect and its ResizeObserver never fires, so every chart renders no <svg>
// at all ("The width(0) and height(0) of chart should be greater than 0").
//
// happy-dom's getComputedStyle does report declared sizes (inline or from a
// stylesheet), so stand in for layout with a minimal block-flow
// approximation: px sizes are used as-is, percentages resolve against the
// parent, auto width fills the parent (block elements stretch to their
// containing block), auto height is 0 (content height is unknowable without
// layout), and the root resolves against the viewport. A chart therefore
// only gets a non-zero size if its own markup gives it one (the components'
// `.chart-body` wrapper, sized by the injected rules above).
function resolveLength(value: string, parentSize: number, autoSize: number): number {
  if (value.endsWith('px')) return parseFloat(value);
  if (value.endsWith('%')) return (parseFloat(value) / 100) * parentSize;
  return autoSize;
}

function layoutSize(el: Element): { width: number; height: number } {
  const parent = el.parentElement;
  const container = parent
    ? layoutSize(parent)
    : { width: window.innerWidth, height: window.innerHeight };
  const style = getComputedStyle(el);
  return {
    width: resolveLength(style.width, container.width, container.width),
    height: resolveLength(style.height, container.height, 0),
  };
}

Element.prototype.getBoundingClientRect = function getBoundingClientRect(): DOMRect {
  const { width, height } = layoutSize(this);
  return new DOMRect(0, 0, width, height);
};

// App's pages are React.lazy chunks (see App.tsx). The first findBy* for a page
// waits on vite-node transforming that page plus recharts/cyberui-2045, which
// can outlast findBy's 1s default on a cold or busy machine. A longer ceiling
// only changes how long a failing test waits; passing tests still return as
// soon as the element appears.
configure({ asyncUtilTimeout: 5000 });
