import { describe, it, expect } from 'vitest';
import { JsonReasoningParser } from '../../../src/intelligence/reasoning/parsing/JsonReasoningParser';
import { StructuredOutputParser } from '../../../src/intelligence/reasoning/parsing/StructuredOutputParser';
import { ReasoningNormalizer } from '../../../src/intelligence/reasoning/parsing/ReasoningNormalizer';

describe('Reasoning Parsing & Normalization (Phase 5.4)', () => {
  const jsonParser = new JsonReasoningParser();
  const outputParser = new StructuredOutputParser();
  const normalizer = new ReasoningNormalizer();

  it('should extract JSON from markdown code block', () => {
    const raw = '```json\n{"conclusions": [{"statement": "Bug in AuthService", "confidence": 0.85}]}\n```';
    const parsed = jsonParser.extractJson(raw);
    expect(parsed.conclusions).toBeDefined();
    expect(parsed.conclusions[0].statement).toBe('Bug in AuthService');
  });

  it('should extract JSON from raw substring with outer braces', () => {
    const raw = 'Here is the reasoning output:\n{"decision": {"status": "READY_FOR_EXECUTION", "targets": ["src/index.ts"]}}\nHope this helps.';
    const parsed = outputParser.parse(raw);
    expect(parsed.decision.status).toBe('READY_FOR_EXECUTION');
  });

  it('ReasoningNormalizer should clamp confidence and fill default collections', () => {
    const raw = {
      conclusions: ['Single string conclusion'],
      confidence: 1.5 // Out of bounds
    };
    const normalized = normalizer.normalize(raw, 'task_1', 'model_1', 'pkg_1');

    expect(normalized.confidence).toBe(1.0);
    expect(normalized.conclusions?.length).toBe(1);
    expect(normalized.conclusions?.[0].statement).toBe('Single string conclusion');
    expect(normalized.observations).toEqual([]);
    expect(normalized.uncertainty).toEqual([]);
  });
});
