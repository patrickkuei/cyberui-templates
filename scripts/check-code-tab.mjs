#!/usr/bin/env node
// Verifies the site's Code tab (packages/site/src/content/codeTabs.json): every
// excerpt it shows still appears verbatim in the file it names, and every
// folder in its map still exists. The tab states principles and shows real
// code as evidence; an excerpt that no longer matches its file, or a folder
// that was renamed, is a claim with nothing behind it.
//
// Lives at the repo root, not in packages/site, so the site package stays
// self-contained, and uses only Node built-ins so CI needs no install.
//
// When it fails: copy the new lines from the file into the JSON excerpt (one
// array entry per line, indentation included), or drop the principle if the
// code no longer follows it.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * @param {Record<string, any>} codeTabs codeTabs.json, parsed
 * @param {string} repoRoot absolute path to the repository root
 * @returns {string[]} one problem per failure; empty when all is well
 */
export function checkCodeTabs(codeTabs, repoRoot) {
  const problems = [];
  for (const [slug, tab] of Object.entries(codeTabs)) {
    const pkg = path.join(repoRoot, 'packages', slug);
    if (!existsSync(pkg)) {
      problems.push(`Code tab "${slug}": there is no packages/${slug}.`);
      continue;
    }
    for (const principle of tab.principles) {
      const file = path.join(pkg, principle.file);
      if (!existsSync(file)) {
        problems.push(`Code tab "${slug}" (${principle.name}): packages/${slug}/${principle.file} does not exist.`);
        continue;
      }
      // Checkouts on Windows may have CRLF line endings; the JSON never does.
      const source = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
      if (!source.includes(principle.excerpt.join('\n'))) {
        problems.push(
          `Code tab "${slug}" (${principle.name}): the excerpt no longer appears verbatim in packages/${slug}/${principle.file}. ` +
            'Refresh it in packages/site/src/content/codeTabs.json.'
        );
      }
    }
    for (const folder of tab.folders) {
      if (!existsSync(path.join(pkg, folder.path))) {
        problems.push(`Code tab "${slug}" (folder map): packages/${slug}/${folder.path} does not exist.`);
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
  const count = Object.keys(codeTabs).length;
  console.log(`code tab OK (${count} template${count === 1 ? '' : 's'} checked)`);
}
