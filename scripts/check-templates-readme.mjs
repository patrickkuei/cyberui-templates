#!/usr/bin/env node
// Verifies that the root README's template table lists exactly the templates
// the site publishes (packages/site/src/data/templates.ts): same slugs, same
// names. The site's Templates page is the source of truth; the README is a
// copy, and a copy that lists a placeholder or misses a template is a false
// claim to anyone who finds the repo before the site.
//
// Lives at the repo root, not in packages/site, so the site package stays
// self-contained, and uses only Node built-ins so CI needs no install.
//
// It reads templates.ts as text, so it relies on each entry writing `slug:`
// and then `name:` as the next property. If you reorder them it fails loudly
// ("could not find any template") rather than passing silently.
//
// When it fails: edit the table under "## Templates" in README.md to match.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** @param {string} source contents of templates.ts */
export function parseTemplates(source) {
  const found = [...source.matchAll(/slug:\s*(['"])([^'"]+)\1,\s*name:\s*(['"])([^'"]+)\3/g)];
  if (found.length === 0) {
    throw new Error('Could not find any template (slug followed by name) in templates.ts. Did the property order change?');
  }
  // Every entry must have been read. A slug or name written another way (a name
  // with an apostrophe, a template literal) would otherwise be skipped in
  // silence and the README never checked for it.
  const declared = [...source.matchAll(/^\s*slug:\s*['"`]/gm)].length;
  if (declared !== found.length) {
    throw new Error(
      `Could not read every template in templates.ts: found ${declared} slug${declared === 1 ? '' : 's'} but only ${found.length} slug-and-name pair${found.length === 1 ? '' : 's'}. ` +
        'Write each slug and name as a plain single- or double-quoted string without quotes inside.'
    );
  }
  return found.map((match) => ({ slug: match[2], name: match[4] }));
}

/** @param {string} readme contents of README.md */
export function parseReadmeRows(readme) {
  const lines = readme.replace(/\r\n/g, '\n').split('\n');
  const start = lines.findIndex((line) => line.trim() === '## Templates');
  if (start === -1) return [];
  const rows = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('## ')) break;
    const row = line.match(/^\|\s*\[([^\]]+)\]\(packages\/([^)\s]+)\)/);
    if (row) rows.push({ slug: row[2], name: row[1] });
  }
  return rows;
}

/**
 * @param {{slug: string, name: string}[]} templates from the site
 * @param {{slug: string, name: string}[]} rows from the README
 * @returns {string[]} one problem per mismatch; empty when all is well
 */
export function checkReadme(templates, rows) {
  const problems = [];
  for (const template of templates) {
    const row = rows.find((candidate) => candidate.slug === template.slug);
    if (!row) {
      problems.push(`README.md does not list the published template "${template.slug}" (${template.name}).`);
    } else if (row.name !== template.name) {
      problems.push(`README.md names "${template.slug}" "${row.name}" but the site calls it "${template.name}".`);
    }
  }
  for (const row of rows) {
    if (!templates.some((template) => template.slug === row.slug)) {
      problems.push(`README.md lists "${row.slug}" but the site does not publish it. Planned templates belong in GitHub issues, not the table.`);
    }
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const templates = parseTemplates(readFileSync(path.join(repoRoot, 'packages', 'site', 'src', 'data', 'templates.ts'), 'utf8'));
  const rows = parseReadmeRows(readFileSync(path.join(repoRoot, 'README.md'), 'utf8'));
  const problems = checkReadme(templates, rows);
  if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log(`README template table OK (${templates.length} template${templates.length === 1 ? '' : 's'} checked)`);
}
