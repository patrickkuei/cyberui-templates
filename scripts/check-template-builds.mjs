#!/usr/bin/env node
// Verifies that every template the site publishes (packages/site/src/data/
// templates.ts) is actually built and copied into the deployed site: it must be
// in TEMPLATE_BUILDS (packages/site/scripts/sync-template-builds.mjs, used for
// local dev) and in .github/workflows/deploy.yml (build step and copy into
// site/dist/live/<slug>/), and the pnpm filter it names must be the package's
// real name. Without this, forgetting the deploy step leaves the live preview
// blank in production while every other check stays green.
//
// Lives at the repo root, not in packages/site, so the site package stays
// self-contained, and uses only Node built-ins so CI needs no install. It reads
// the workflow as text: it looks for the build command and the copy
// destination, so reformatting the YAML is fine, renaming those is not.
//
// When it fails: add the missing line the message names.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseTemplates } from './check-templates-readme.mjs';

/** @param {string} source contents of sync-template-builds.mjs */
export function parseBuilds(source) {
  const list = source.match(/TEMPLATE_BUILDS\s*=\s*\[([\s\S]*?)\];/);
  if (!list) throw new Error('Could not find TEMPLATE_BUILDS in sync-template-builds.mjs. Did it move or get renamed?');
  return [...list[1].matchAll(/slug:\s*'([^']+)'\s*,\s*pnpmFilter:\s*'([^']+)'/g)].map((m) => ({ slug: m[1], pnpmFilter: m[2] }));
}

/**
 * @param {{ slugs: string[], builds: {slug: string, pnpmFilter: string}[], workflow: string, packageNames: Record<string, string> }} input
 * @returns {string[]} one problem per mismatch; empty when all is well
 */
export function checkBuilds({ slugs, builds, workflow, packageNames }) {
  const problems = [];
  for (const slug of slugs) {
    const build = builds.find((candidate) => candidate.slug === slug);
    if (!build) {
      problems.push(`"${slug}" is published by the site but missing from TEMPLATE_BUILDS in packages/site/scripts/sync-template-builds.mjs.`);
      continue;
    }
    const name = packageNames[slug];
    if (name !== build.pnpmFilter) {
      problems.push(`TEMPLATE_BUILDS names pnpmFilter "${build.pnpmFilter}" for "${slug}", but packages/${slug}/package.json is named "${name}".`);
    }
    if (!workflow.includes(`pnpm --filter ${build.pnpmFilter} run build`)) {
      problems.push(`.github/workflows/deploy.yml has no build step for "${slug}" (expected \`pnpm --filter ${build.pnpmFilter} run build\`).`);
    }
    if (!workflow.includes(`packages/${slug}/dist/. packages/site/dist/live/${slug}/`)) {
      problems.push(`.github/workflows/deploy.yml does not copy packages/${slug}/dist into site/dist/live/${slug}/.`);
    }
  }
  for (const build of builds) {
    if (!slugs.includes(build.slug)) {
      problems.push(`TEMPLATE_BUILDS lists "${build.slug}" but the site does not publish it (src/data/templates.ts).`);
    }
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const read = (...parts) => readFileSync(path.join(repoRoot, ...parts), 'utf8');
  const slugs = parseTemplates(read('packages', 'site', 'src', 'data', 'templates.ts')).map((t) => t.slug);
  const builds = parseBuilds(read('packages', 'site', 'scripts', 'sync-template-builds.mjs'));
  const packageNames = Object.fromEntries(slugs.map((slug) => [slug, JSON.parse(read('packages', slug, 'package.json')).name]));
  const problems = checkBuilds({ slugs, builds, workflow: read('.github', 'workflows', 'deploy.yml'), packageNames });
  if (problems.length > 0) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log(`template builds OK (${slugs.length} template${slugs.length === 1 ? '' : 's'} checked)`);
}
