import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { checkLicenses } from './check-license.mjs';

const MIT = 'MIT License\n\nCopyright (c) 2026 Someone\n';

function fakeRepo({ license = MIT, manifest = { license: 'MIT' } } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'license-'));
  const pkg = path.join(root, 'packages', 'demo');
  mkdirSync(pkg, { recursive: true });
  writeFileSync(path.join(root, 'LICENSE'), MIT);
  if (license !== null) writeFileSync(path.join(pkg, 'LICENSE'), license);
  if (manifest !== null) writeFileSync(path.join(pkg, 'package.json'), typeof manifest === 'string' ? manifest : JSON.stringify(manifest));
  return root;
}

test('no problems when the package has an identical LICENSE and "license": "MIT"', () => {
  assert.deepEqual(checkLicenses(['demo'], fakeRepo()), []);
});

test('matches a LICENSE with Windows line endings', () => {
  assert.deepEqual(checkLicenses(['demo'], fakeRepo({ license: MIT.replace(/\n/g, '\r\n') })), []);
});

test('reports a package with no LICENSE', () => {
  const problems = checkLicenses(['demo'], fakeRepo({ license: null }));
  assert.equal(problems.length, 1);
  assert.match(problems[0], /packages\/demo\/LICENSE is missing/);
});

test('reports a LICENSE that has drifted from the root', () => {
  const problems = checkLicenses(['demo'], fakeRepo({ license: MIT + 'extra\n' }));
  assert.equal(problems.length, 1);
  assert.match(problems[0], /differs from the root LICENSE/);
});

test('reports a package.json without "license": "MIT"', () => {
  for (const manifest of [{ name: 'demo' }, { license: 'ISC' }]) {
    const problems = checkLicenses(['demo'], fakeRepo({ manifest }));
    assert.equal(problems.length, 1);
    assert.match(problems[0], /"license": "MIT"/);
  }
});

test('reports a package.json that is missing or not JSON', () => {
  assert.match(checkLicenses(['demo'], fakeRepo({ manifest: null }))[0], /package\.json is missing/);
  assert.match(checkLicenses(['demo'], fakeRepo({ manifest: '{ nope' }))[0], /not valid JSON/);
});

test('reports a template slug with no package folder', () => {
  const problems = checkLicenses(['ghost'], fakeRepo());
  assert.equal(problems.length, 1);
  assert.match(problems[0], /no packages\/ghost/);
});
