import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { checkCodeTabs } from './check-code-tab.mjs';

function fakeRepo(source = 'export const LIMIT = 2;\nexport const OTHER = 3;\n') {
  const root = mkdtempSync(path.join(tmpdir(), 'code-tab-'));
  const pkg = path.join(root, 'packages', 'demo');
  mkdirSync(path.join(pkg, 'src', 'data'), { recursive: true });
  writeFileSync(path.join(pkg, 'src', 'data', 'limits.ts'), source);
  return root;
}

const tab = (principles, folders = []) => ({ demo: { principles, folders } });
const principle = (excerpt, file = 'src/data/limits.ts') => ({ name: 'SSoT', detail: 'x', file, excerpt });

test('no problems when every excerpt matches and every folder exists', () => {
  const root = fakeRepo();
  const problems = checkCodeTabs(
    tab([principle(['export const LIMIT = 2;', 'export const OTHER = 3;'])], [{ path: 'src/data', purpose: 'x' }]),
    root
  );
  assert.deepEqual(problems, []);
});

test('matches a file with Windows line endings', () => {
  const root = fakeRepo('export const LIMIT = 2;\r\nexport const OTHER = 3;\r\n');
  assert.deepEqual(checkCodeTabs(tab([principle(['export const LIMIT = 2;', 'export const OTHER = 3;'])]), root), []);
});

test('reports an excerpt that has drifted from its file', () => {
  const root = fakeRepo('export const LIMIT = 5;\n');
  const problems = checkCodeTabs(tab([principle(['export const LIMIT = 2;'])]), root);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /no longer appears verbatim/);
  assert.match(problems[0], /SSoT/);
});

test('reports a principle file that no longer exists', () => {
  const root = fakeRepo();
  const problems = checkCodeTabs(tab([principle(['x'], 'src/data/gone.ts')]), root);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /src\/data\/gone\.ts/);
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
