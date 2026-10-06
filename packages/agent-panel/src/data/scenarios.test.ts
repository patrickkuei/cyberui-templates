import { describe, it, expect } from 'vitest';
import { FALLBACK, SCENARIOS, SUGGESTED_PROMPTS, matchScenario } from './scenarios';
import type { Step } from './types';

// Every way through a scenario: each approval forks into its approve and
// reject branches. A run that ends without a `reply` would leave the agent
// stuck "working" forever, which is the failure these tests exist to prevent.
function paths(steps: Step[]): Step[][] {
  const at = steps.findIndex((step) => step.type === 'approval');
  if (at === -1) return [steps];
  const approval = steps[at]!;
  if (approval.type !== 'approval') return [steps];
  const head = steps.slice(0, at);
  const tail = steps.slice(at + 1);
  return [...paths(approval.approve), ...paths(approval.reject)].map((branch) => [...head, ...branch, ...tail]);
}

describe('scenarios', () => {
  it('every path through every scenario ends in a reply', () => {
    for (const scenario of [...SCENARIOS, FALLBACK]) {
      for (const path of paths(scenario.steps)) {
        expect(path[path.length - 1]?.type, `${scenario.id} must end in a reply`).toBe('reply');
      }
    }
  });

  it('shares no keyword between scenarios, so matching is unambiguous', () => {
    const seen = new Map<string, string>();
    for (const scenario of SCENARIOS) {
      for (const keyword of scenario.keywords) {
        expect(seen.get(keyword), `"${keyword}" is in ${scenario.id} and ${seen.get(keyword)}`).toBeUndefined();
        seen.set(keyword, scenario.id);
      }
    }
  });

  it('keywords are lower case, because matching lower-cases the message', () => {
    for (const scenario of SCENARIOS) {
      for (const keyword of scenario.keywords) expect(keyword).toBe(keyword.toLowerCase());
    }
  });

  it('gives the fallback no keywords and matches it only when nothing else does', () => {
    expect(FALLBACK.keywords).toEqual([]);
    expect(matchScenario('hello there')).toBe(FALLBACK);
  });

  it('matches case-insensitively', () => {
    expect(matchScenario('PLEASE REFUND IT').id).toBe('refund');
  });

  it('each suggested prompt selects a real scenario, in order', () => {
    expect(SUGGESTED_PROMPTS.map((prompt) => matchScenario(prompt.text).id)).toEqual(['refund', 'summary', 'release']);
  });

  it('every approval offers both a branch to approve and one to reject', () => {
    for (const scenario of SCENARIOS) {
      for (const step of scenario.steps) {
        if (step.type === 'approval') {
          expect(step.approve.length).toBeGreaterThan(0);
          expect(step.reject.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
