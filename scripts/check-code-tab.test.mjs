import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { checkCodeTabs } from './check-code-tab.mjs';

function fakeRepo() {
  const root = mkdtempSync(path.join(tmpdir(), 'code-tab-'));
  const pkg = path.join(root, 'packages', 'demo');
  mkdirSync(path.join(pkg, 'src', 'data'), { recursive: true });
  writeFileSync(path.join(pkg, 'src', 'data', 'limits.ts'), 'export {};\n');
  return root;
}

const tab = (files, folders) => ({
  demo: { principles: [{ name: 'SSoT', detail: 'x', files }], folders },
});

test('no problems when every linked file and folder exists', () => {
  const root = fakeRepo();
  const problems = checkCodeTabs(tab([{ label: 'limits.ts', path: 'src/data/limits.ts' }], [{ path: 'src/data', purpose: 'x' }]), root);
  assert.deepEqual(problems, []);
});

test('reports a principle file that no longer exists', () => {
  const root = fakeRepo();
  const problems = checkCodeTabs(tab([{ label: 'gone.ts', path: 'src/data/gone.ts' }], []), root);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /src\/data\/gone\.ts/);
  assert.match(problems[0], /SSoT/);
});

test('reports a folder in the map that no longer exists', () => {
  const root = fakeRepo();
  const problems = checkCodeTabs(tab([], [{ path: 'src/missing', purpose: 'x' }]), root);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /src\/missing/);
});

test('reports a template whose package folder does not exist', () => {
  const root = fakeRepo();
  const problems = checkCodeTabs({ ghost: { principles: [], folders: [] } }, root);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /packages\/ghost/);
});
