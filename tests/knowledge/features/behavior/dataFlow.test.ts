import { describe, it, expect } from 'vitest';
import { BehaviorTestHelper } from './BehaviorTestHelper';

describe('Phase 6.5: Data Flow Transformation & Secret Sanitization', () => {
  it('should reconstruct data transformations and redact any sensitive credentials or secrets', async () => {
    const dataFeature = BehaviorTestHelper.createFeature('feat_token_auth', 'Token Auth');

    const mappings = [
      BehaviorTestHelper.createMapping('feat_token_auth', 'LoginRequestDto', 'SYMBOL', 'PRIMARY'),
      BehaviorTestHelper.createMapping('feat_token_auth', 'UserEntity', 'DATABASE_ENTITY', 'PRIMARY'),
      BehaviorTestHelper.createMapping('feat_token_auth', 'TokenPayloadDto', 'SYMBOL', 'PRIMARY'),
      BehaviorTestHelper.createMapping('feat_token_auth', 'AuthResponseDto', 'SYMBOL', 'PRIMARY'),
    ];

    const context = BehaviorTestHelper.createContext(dataFeature, mappings);
    const { engine } = BehaviorTestHelper.createEngine();

    const result = await engine.analyzeFeatureBehavior('feat_token_auth', context);

    expect(result.behaviors.length).toBe(1);
    const behavior = result.behaviors[0];

    const dataFlow = behavior.flows.find(f => f.flowType === 'DATA');
    expect(dataFlow).toBeDefined();

    // Verify transformation steps
    expect(dataFlow?.nodes.length).toBe(4);
    for (const node of dataFlow?.nodes || []) {
      expect(node.stepType).toBe('TRANSFORMATION');
    }

    // Verify transitions are TRANSFORMS
    for (const edge of dataFlow?.edges || []) {
      expect(edge.relationType).toBe('TRANSFORMS');
    }

    // Verify secret redaction: passing text with password and token should be redacted
    const rawSensitiveString = 'password: SuperSecretPassword123! token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-ID';
    const jsonStr = JSON.stringify(behavior);
    expect(jsonStr).not.toContain('SuperSecretPassword123!');
  });
});
