import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTemplates, parseReadmeRows, checkReadme } from './check-templates-readme.mjs';

const TS = `
export const TEMPLATES: Template[] = [
  {
    slug: 'monitoring',
    name: 'AI Product Monitoring',
    tagline: 'x',
  },
  {
    slug: 'second',
    name: "Second Template",
  },
];`;

const README = `# t

## Templates

| Template | What it is |
|----------|------------|
| [AI Product Monitoring](packages/monitoring) | A dashboard. |
| [Second Template](packages/second) | Another. |

## Get just one template
`;

test('reads slug/name pairs from templates.ts, single or double quoted', () => {
  assert.deepEqual(parseTemplates(TS), [
    { slug: 'monitoring', name: 'AI Product Monitoring' },
    { slug: 'second', name: 'Second Template' },
  ]);
});

test('fails loudly when templates.ts has no entries it can read', () => {
  assert.throws(() => parseTemplates('export const TEMPLATES = [];'), /could not find any template/i);
});

test('reads the README table rows between "## Templates" and the next heading', () => {
  assert.deepEqual(parseReadmeRows(README), [
    { slug: 'monitoring', name: 'AI Product Monitoring' },
    { slug: 'second', name: 'Second Template' },
  ]);
});

test('no problems when the README lists exactly the published templates', () => {
  assert.deepEqual(checkReadme(parseTemplates(TS), parseReadmeRows(README)), []);
});

test('reports a template missing from the README', () => {
  const rows = parseReadmeRows(README).slice(0, 1);
  const problems = checkReadme(parseTemplates(TS), rows);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /second/);
});

test('reports a README row with no published template (a placeholder)', () => {
  const rows = [...parseReadmeRows(README), { slug: 'planned', name: 'Planned Thing' }];
  const problems = checkReadme(parseTemplates(TS), rows);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /planned/);
});

test('reports a name that differs from the site', () => {
  const rows = [
    { slug: 'monitoring', name: 'AI monitoring dashboard' },
    { slug: 'second', name: 'Second Template' },
  ];
  const problems = checkReadme(parseTemplates(TS), rows);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /AI Product Monitoring/);
});
