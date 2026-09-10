import { describe, it, expect } from 'vitest';
import { ImpactExplainer } from '../../../../src/knowledge/features/impact/core/ImpactExplainer.js';
import { ImpactTestHelper } from './ImpactTestHelper.js';
import type { FeatureImpact } from '../../../../src/knowledge/features/impact/models/FeatureImpact.js';
import type { ResourceImpact } from '../../../../src/knowledge/features/impact/models/ResourceImpact.js';
import type { ImpactPath } from '../../../../src/knowledge/features/impact/models/ImpactPath.js';

describe('Phase 6.7 - Explainability', () => {
  it('ImpactExplainer should answer all canonical questions from Section 44 in clear Markdown', () => {
    const explainer = new ImpactExplainer();

    const change = ImpactTestHelper.createChange('AuthService.login', 'SYMBOL', 'MODIFIED', {
      name: 'AuthService.login',
    });

    const directImpact: FeatureImpact = {
      impactId: 'f1',
      targetFeatureId: 'Authentication',
      impactType: 'DIRECT',
      impactScope: 'FEATURE',
      direction: 'DOWNSTREAM',
      severity: 'HIGH',
      score: 95,
      confidence: 'VERY_HIGH',
      direct: true,
      distance: 0,
      evidence: [
        {
          evidenceId: 'e1',
          source: 'MAPPING',
          sourceId: 'm1',
          evidenceType: 'DIRECT_MAPPING',
          description: 'AuthService.login is mapped directly to Authentication.',
          confidence: 0.95,
        },
      ],
      impactPathIds: [],
      contributingChanges: [],
      criticality: 'HIGH',
      knowledgeVersion: '1.0.0',
      impactVersion: 1,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const indirectImpact: FeatureImpact = {
      impactId: 'f2',
      targetFeatureId: 'Checkout',
      impactType: 'INDIRECT',
      impactScope: 'FEATURE',
      direction: 'DOWNSTREAM',
      severity: 'MEDIUM',
      score: 75,
      confidence: 'HIGH',
      direct: false,
      distance: 1,
      evidence: [
        {
          evidenceId: 'e2',
          source: 'DEPENDENCY',
          sourceId: 'r1',
          evidenceType: 'FEATURE_DEPENDENCY',
          description: 'Checkout depends on Authentication.',
          confidence: 0.9,
        },
      ],
      impactPathIds: ['p1'],
      contributingChanges: [],
      criticality: 'HIGH',
      knowledgeVersion: '1.0.0',
      impactVersion: 1,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const testImpact: ResourceImpact = {
      impactId: 'r1',
      changeTarget: { targetId: 'AuthService.login', targetType: 'SYMBOL' },
      affectedResourceId: 'tests/AuthService.test.ts',
      affectedResourceType: 'TEST',
      impactType: 'VERIFICATION',
      scope: 'RESOURCE',
      severity: 'LOW',
      score: 80,
      confidence: 'HIGH',
      evidence: [],
      pathIds: [],
      active: true,
      knowledgeVersion: '1.0.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const path: ImpactPath = {
      pathId: 'p1',
      sourceNode: { nodeId: 'n1', resourceId: 'AuthService.login', resourceType: 'SYMBOL', featureId: 'Authentication', confidence: 0.95 },
      targetNode: { nodeId: 'n2', resourceId: 'Checkout', resourceType: 'FEATURE', featureId: 'Checkout', confidence: 0.9 },
      nodes: [
        { nodeId: 'n1', resourceId: 'AuthService.login', resourceType: 'SYMBOL', featureId: 'Authentication', confidence: 0.95 },
        { nodeId: 'n2', resourceId: 'Checkout', resourceType: 'FEATURE', featureId: 'Checkout', confidence: 0.9 },
      ],
      edges: [
        { sourceNodeId: 'n1', targetNodeId: 'n2', relationshipType: 'DEPENDS_ON', direction: 'DOWNSTREAM', confidence: 0.9 },
      ],
      pathType: 'INDIRECT',
      distance: 1,
      confidence: 'HIGH',
      evidence: [],
    };

    const report = explainer.explainChange(change, [directImpact, indirectImpact], [testImpact], [path]);

    expect(report).toContain('Change Impact Assessment: `AuthService.login`');
    expect(report).toContain('Directly Affected Features:');
    expect(report).toContain('Authentication');
    expect(report).toContain('Indirectly Affected Features:');
    expect(report).toContain('Checkout');
    expect(report).toContain('Tests Requiring Review (Verification Impact)');
    expect(report).toContain('tests/AuthService.test.ts');
    expect(report).toContain('Propagation Paths');

    const whyReport = explainer.explainWhyAffected('Checkout', [directImpact, indirectImpact], [path]);
    expect(whyReport).toContain('Why is "Checkout" affected?');
    expect(whyReport).toContain('Checkout depends on Authentication.');
  });
});
