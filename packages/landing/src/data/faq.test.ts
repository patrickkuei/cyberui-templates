import { describe, it, expect } from 'vitest';
import { FAQ } from './faq';

describe('faq', () => {
  it('has six questions with distinct ids and non-empty answers', () => {
    expect(FAQ).toHaveLength(6);
    expect(new Set(FAQ.map((item) => item.id)).size).toBe(6);
    for (const item of FAQ) {
      expect(item.question.endsWith('?')).toBe(true);
      expect(item.answer.length).toBeGreaterThan(20);
    }
  });
});
