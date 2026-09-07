import { describe, it, expect } from 'vitest';
import { FeatureRelationshipValidator } from '../../../../src/knowledge/features/dependencies/core/FeatureRelationshipValidator';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { FeatureRelationshipCandidate } from '../../../../src/knowledge/features/dependencies/models/FeatureRelationshipCandidate';
import type { FeatureRelationship } from '../../../../src/knowledge/features/dependencies/models/FeatureRelationship';

describe('Feature Dependency Graph: Self Dependency Rejection', () => {
  const validator = new FeatureRelationshipValidator();
  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
  const featA = createDefaultFeature('feat_a' as any, 'Service A', scope);
  const featureMap = new Map([['feat_a', featA]]);

  it('should reject candidate self-dependency where source equals target', () => {
    const candidate: FeatureRelationshipCandidate = {
      candidateId: 'cand_self',
      sourceFeatureId: 'feat_a',
      targetFeatureId: 'feat_a',
      proposedType: 'DEPENDS_ON',
      direction: 'DIRECTED',
      evidence: [
        {
          evidenceId: 'ev_1',
          sourceType: 'CODE_DEPENDENCY',
          sourceId: 'src/self.ts',
          evidenceType: 'INTERNAL_CALL',
          description: 'Internal method invocation',
          strength: 0.9,
          confidence: 0.9,
          metadata: {},
          timestamp: 0,
        },
      ],
      score: 0.9,
      confidence: { level: 'HIGH', score: 0.9, reasons: [] },
      sources: ['CODE_DEPENDENCY'],
      conflicts: [],
      status: 'DETECTED',
      createdAt: 0,
      updatedAt: 0,
    };

    const result = validator.validateCandidate(candidate, featureMap, 'repo-1');
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes('Self-dependency detected'))).toBe(true);
  });

  it('should reject relationship entity where source equals target', () => {
    const rel: FeatureRelationship = {
      relationshipId: 'rel_self',
      sourceFeatureId: 'feat_a' as any,
      targetFeatureId: 'feat_a' as any,
      relationshipType: 'DEPENDS_ON',
      direction: 'DIRECTED',
      confidence: { level: 'HIGH', score: 0.9, reasons: [] },
      score: 0.9,
      evidence: [],
      source: 'DISCOVERED',
      scope,
      createdAt: 0,
      updatedAt: 0,
      knowledgeVersion: '2.0.0',
      relationshipVersion: 1,
      active: true,
    };

    const result = validator.validateRelationship(rel, featureMap);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes('Self-dependency detected'))).toBe(true);
  });
});
