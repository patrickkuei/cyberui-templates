import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseBuilds, checkBuilds } from './check-template-builds.mjs';

const SYNC = `
const TEMPLATE_BUILDS = [
  { slug: 'monitoring', pnpmFilter: 'monitoring-template' },
  { slug: 'agent-panel', pnpmFilter: 'agent-panel-template' },
];`;

const WORKFLOW = `
      - run: pnpm --filter monitoring-template run build
      - run: pnpm --filter agent-panel-template run build
      - run: |
          mkdir -p packages/site/dist/live/monitoring
          cp -r packages/monitoring/dist/. packages/site/dist/live/monitoring/
          mkdir -p packages/site/dist/live/agent-panel
          cp -r packages/agent-panel/dist/. packages/site/dist/live/agent-panel/
`;

const good = {
  slugs: ['monitoring', 'agent-panel'],
  builds: parseBuilds(SYNC),
  workflow: WORKFLOW,
  packageNames: { monitoring: 'monitoring-template', 'agent-panel': 'agent-panel-template' },
};

test('parses the sync script list', () => {
  assert.deepEqual(parseBuilds(SYNC), [
    { slug: 'monitoring', pnpmFilter: 'monitoring-template' },
    { slug: 'agent-panel', pnpmFilter: 'agent-panel-template' },
  ]);
});

test('throws when it cannot find the list, instead of passing silently', () => {
  assert.throws(() => parseBuilds('const x = 1;'), /TEMPLATE_BUILDS/);
});

test('passes when the three lists agree', () => {
  assert.deepEqual(checkBuilds(good), []);
});

test('reports a published template missing from the sync script', () => {
  const problems = checkBuilds({ ...good, builds: good.builds.filter((b) => b.slug !== 'agent-panel') });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /agent-panel.*sync-template-builds/);
});

test('reports a template missing its build step or its copy into live/ in deploy.yml', () => {
  const noBuild = checkBuilds({ ...good, workflow: WORKFLOW.replace('pnpm --filter agent-panel-template run build', '') });
  assert.match(noBuild.join('\n'), /deploy\.yml.*agent-panel-template/);
  const noCopy = checkBuilds({ ...good, workflow: WORKFLOW.replace('cp -r packages/agent-panel/dist/. packages/site/dist/live/agent-panel/', '') });
  assert.match(noCopy.join('\n'), /deploy\.yml.*live\/agent-panel/);
});

test('reports a pnpm filter that is not the package.json name', () => {
  const problems = checkBuilds({ ...good, packageNames: { ...good.packageNames, 'agent-panel': 'something-else' } });
  assert.match(problems.join('\n'), /pnpmFilter.*something-else/);
});

test('reports an entry in the sync script for a template the site does not publish', () => {
  const problems = checkBuilds({ ...good, slugs: ['monitoring'] });
  assert.match(problems.join('\n'), /agent-panel.*does not publish/);
});
