#!/usr/bin/env node
// Verifies that every file and folder the site's Code tab links to still
// exists in the template it names (packages/<slug>/<path>). The Code tab
// (packages/site/src/content/codeTabs.json) states principles and points at
// real files as evidence; a link to a file that was renamed or deleted is a
// claim with nothing behind it.
//
// Lives at the repo root, not in packages/site, so the site package stays
// self-contained, and uses only Node built-ins so CI needs no install.
//
// When it fails: update the path in codeTabs.json (or drop the principle if
// the code no longer follows it).
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * @param {Record<string, any>} codeTabs codeTabs.json, parsed
 * @param {string} repoRoot absolute path to the repository root
 * @returns {string[]} one problem per missing path; empty when all is well
 */
export function checkCodeTabs(codeTabs, repoRoot) {
  const problems = [];
  for (const [slug, tab] of Object.entries(codeTabs)) {
    const pkg = path.join(repoRoot, 'packages', slug);
    if (!existsSync(pkg)) {
      problems.push(`Code tab "${slug}": there is no packages/${slug}.`);
      continue;
    }
    const paths = [
      ...tab.principles.flatMap((principle) => principle.files.map((file) => ({ where: principle.name, path: file.path }))),
      ...tab.folders.map((folder) => ({ where: 'folder map', path: folder.path })),
    ];
    for (const item of paths) {
      if (!existsSync(path.join(pkg, item.path))) {
        problems.push(`Code tab "${slug}" (${item.where}): packages/${slug}/${item.path} does not exist.`);
      }
    }
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const file = path.join(repoRoot, 'packages', 'site', 'src', 'content', 'codeTabs.json');
  const codeTabs = JSON.parse(readFileSync(file, 'utf8'));
  const problems = checkCodeTabs(codeTabs, repoRoot);
  if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log(`code tab paths OK (${Object.keys(codeTabs).length} template${Object.keys(codeTabs).length === 1 ? '' : 's'} checked)`);
}
