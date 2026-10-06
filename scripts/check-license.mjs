#!/usr/bin/env node
// Verifies that every template package carries its own copy of the root
// LICENSE and declares `"license": "MIT"` in its package.json. Forkers copy one
// package with `npx tiged patrickkuei/cyberui-templates/packages/<name>`, which
// leaves the root LICENSE behind; without a copy in the package, the fork has
// no stated terms. A hand-made copy can drift from the root file, so this
// fails when they differ.
//
// A "template package" is one the site publishes (a slug in
// packages/site/src/data/templates.ts), the same list check-templates-readme.mjs
// uses. packages/site is the showcase website, not something to fork, so it is
// deliberately not checked.
//
// Lives at the repo root, not in packages/site, so the site package stays
// self-contained, and uses only Node built-ins so CI needs no install.
//
// When it fails: copy the root LICENSE over the package's (`cp LICENSE
// packages/<slug>/LICENSE`), and add `"license": "MIT"` to its package.json.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseTemplates } from './check-templates-readme.mjs';

// Checkouts on Windows may have CRLF line endings; the committed text is LF.
const normalize = (text) => text.replace(/\r\n/g, '\n');

/**
 * @param {string[]} slugs template package names under packages/
 * @param {string} repoRoot absolute path to the repository root
 * @returns {string[]} one problem per failure; empty when all is well
 */
export function checkLicenses(slugs, repoRoot) {
  const problems = [];
  const rootLicense = normalize(readFileSync(path.join(repoRoot, 'LICENSE'), 'utf8'));
  for (const slug of slugs) {
    const pkg = path.join(repoRoot, 'packages', slug);
    if (!existsSync(pkg)) {
      problems.push(`Template "${slug}": there is no packages/${slug}.`);
      continue;
    }
    const licenseFile = path.join(pkg, 'LICENSE');
    if (!existsSync(licenseFile)) {
      problems.push(`packages/${slug}/LICENSE is missing. Copy the root LICENSE there; tiged forks get only the package folder.`);
    } else if (normalize(readFileSync(licenseFile, 'utf8')) !== rootLicense) {
      problems.push(`packages/${slug}/LICENSE differs from the root LICENSE. Copy the root file over it.`);
    }
    const manifest = path.join(pkg, 'package.json');
    if (!existsSync(manifest)) {
      problems.push(`packages/${slug}/package.json is missing.`);
      continue;
    }
    let license;
    try {
      license = JSON.parse(readFileSync(manifest, 'utf8')).license;
    } catch {
      problems.push(`packages/${slug}/package.json is not valid JSON.`);
      continue;
    }
    if (license !== 'MIT') {
      problems.push(`packages/${slug}/package.json must declare "license": "MIT" (found ${JSON.stringify(license)}).`);
    }
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const templates = parseTemplates(readFileSync(path.join(repoRoot, 'packages', 'site', 'src', 'data', 'templates.ts'), 'utf8'));
  const slugs = templates.map((template) => template.slug);
  const problems = checkLicenses(slugs, repoRoot);
  if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log(`license OK (${slugs.length} template${slugs.length === 1 ? '' : 's'} checked)`);
}
