import { describe, it, expect } from 'vitest';
import { BehaviorTestHelper } from './BehaviorTestHelper';
import { FeatureBehaviorValidator } from '../../../../src/knowledge/features/behavior/core/FeatureBehaviorValidator';
import type { FeatureFlow } from '../../../../src/knowledge/features/behavior/models/FeatureFlow';

describe('Phase 6.5: Security Safeguards & Redaction', () => {
  it('should redact sensitive credentials, tokens, and AWS access keys', async () => {
    const feat = BehaviorTestHelper.createFeature('feat_security_check', 'Security Check');

    const mappings = [
      BehaviorTestHelper.createMapping(
        'feat_security_check',
        'POST /api/login?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.secret',
        'ENDPOINT',
        'PRIMARY',
        {
          secretKey: 'AKIAIOSFODNN7EXAMPLE',
          apiKey: 'apikey: 1234567890abcdef',
        }
      ),
    ];

    const context = BehaviorTestHelper.createContext(feat, mappings);
    const { engine } = BehaviorTestHelper.createEngine();

    const result = await engine.analyzeFeatureBehavior('feat_security_check', context);
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain('AKIAIOSFODNN7EXAMPLE');
    expect(serialized).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.secret');
  });

  it('should reject invalid flows with dangling edge references or invalid step types', async () => {
    const feat = BehaviorTestHelper.createFeature('feat_validator_check', 'Validator Check');
    const context = BehaviorTestHelper.createContext(feat, []);
    const validator = new FeatureBehaviorValidator();

    const corruptedFlow: FeatureFlow = {
      flowId: 'flow_corrupted',
      featureId: 'feat_validator_check',
      name: 'Corrupted Flow',
      flowType: 'PRIMARY',
      direction: 'FORWARD',
      nodes: [
        {
          nodeId: 'node_valid',
          resourceId: 'src/valid.ts',
          resourceType: 'FILE',
          stepType: 'INVALID_STEP' as any,
          label: 'Valid Node',
          metadata: {},
          confidence: 0.8,
        },
      ],
      edges: [
        {
          edgeId: 'edge_dangling',
          sourceNodeId: 'node_valid',
          targetNodeId: 'node_non_existent', // Dangling!
          relationType: 'CALLS',
          asynchronous: false,
          confidence: 0.8,
          evidence: [],
        },
      ],
      exitNodeIds: [],
      confidence: 1.5, // Invalid confidence > 1!
      evidence: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const res = await validator.validateFlow(corruptedFlow, context);
    expect(res.isValid).toBe(false);
    expect(res.errors.some(e => e.includes('Invalid stepType'))).toBe(true);
    expect(res.errors.some(e => e.includes('references missing targetNodeId'))).toBe(true);
    expect(res.errors.some(e => e.includes('confidence must be between 0 and 1'))).toBe(true);
  });
});
