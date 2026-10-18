import { describe, it, expect } from 'vitest';

// Nothing in this template is sent or saved, and this test is what keeps that
// true when someone edits it. App.test.tsx checks that using the app never
// reaches fetch, Bluetooth or notifications; this one reads the source, so it
// also catches code that no test happens to run. It looks at source files, not
// a built bundle, and strips comments first (the mock-boundary comments
// quote the calls a real app would make). Put your real hub or backend code
// somewhere this test does not look, or delete the names you now need from
// FORBIDDEN, on purpose.
const sources = import.meta.glob('./**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

const FORBIDDEN: [name: string, pattern: RegExp][] = [
  ['fetch', /\bfetch\s*\(/],
  ['XMLHttpRequest', /\bXMLHttpRequest\b/],
  ['WebSocket', /\bWebSocket\b/],
  ['EventSource', /\bEventSource\b/],
  ['sendBeacon', /\bsendBeacon\b/],
  ['Bluetooth', /\bbluetooth\b/i],
  ['the Notification API', /\bNotification\b/],
  ['a service worker', /\bserviceWorker\b/],
  ['localStorage', /\blocalStorage\b/],
  ['sessionStorage', /\bsessionStorage\b/],
  ['indexedDB', /\bindexedDB\b/],
  ['cookies', /\bdocument\.cookie\b/],
];

const stripComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

export function forbiddenIn(code: string): string[] {
  const stripped = stripComments(code);
  return FORBIDDEN.filter(([, pattern]) => pattern.test(stripped)).map(([name]) => name);
}

describe('forbiddenIn', () => {
  it('finds each forbidden call', () => {
    expect(forbiddenIn("await fetch('/api')")).toEqual(['fetch']);
    expect(forbiddenIn('navigator.bluetooth.requestDevice()')).toEqual(['Bluetooth']);
    expect(forbiddenIn("new Notification('hi')")).toEqual(['the Notification API']);
    expect(forbiddenIn("localStorage.setItem('a', 'b')")).toEqual(['localStorage']);
  });

  it('ignores comments that merely mention them', () => {
    expect(forbiddenIn("// await fetch('/api/pair')\nconst a = 1;")).toEqual([]);
    expect(forbiddenIn('/* navigator.bluetooth */ const a = 1;')).toEqual([]);
  });
});

describe('nothing is sent or saved', () => {
  it('finds the source files it is meant to scan', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(20);
  });

  it('has no network, Bluetooth, notification or storage code in the app', () => {
    const offenders = Object.entries(sources)
      .filter(([file]) => !/\.test\.tsx?$/.test(file))
      .map(([file, code]) => [file, forbiddenIn(code)] as const)
      .filter(([, found]) => found.length > 0);
    expect(offenders).toEqual([]);
  });
});
