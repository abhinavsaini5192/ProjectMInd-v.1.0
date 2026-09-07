import { describe, it, expect } from 'vitest';
import { TestRelationshipSource } from '../../../../src/knowledge/features/dependencies/sources/TestRelationshipSource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { DependencyContext } from '../../../../src/knowledge/features/dependencies/interfaces/IFeatureRelationshipSource';

describe('Feature Dependency Graph: TestRelationshipSource', () => {
  const source = new TestRelationshipSource();
  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
  const featBilling = createDefaultFeature('feat_billing' as any, 'Billing', scope);
  const featAuth = createDefaultFeature('feat_auth' as any, 'Authentication', scope);
  const allFeatures = [featBilling, featAuth];

  it('should detect VERIFIES relationship from integration test suites as supporting evidence', () => {
    const context: DependencyContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      featureMappings: [
        {
          mappingId: 'm1',
          featureId: 'feat_billing',
          resourceId: 'tests/billing/billing_auth_integration.test.ts',
          resourceType: 'TEST',
          role: 'TEST',
          confidence: { level: 'HIGH', score: 0.9, reasons: [] },
          score: 0.9,
          evidence: [],
          source: 'DISCOVERED',
          scope,
          createdAt: 0,
          updatedAt: 0,
          knowledgeVersion: '2.0.0',
          mappingVersion: 1,
          active: true,
        },
      ],
      tests: [
        {
          id: 'test_1',
          filePath: 'tests/billing/billing_auth_integration.test.ts',
          testName: 'should verify auth token before billing charge',
          targetSymbols: ['AuthService', 'BillingService'],
        } as any,
      ],
    };

    const candidates = source.discoverRelationships(featBilling, allFeatures, context);
    expect(candidates.length).toBe(1);
    expect(candidates[0].sourceFeatureId).toBe('feat_billing');
    expect(candidates[0].targetFeatureId).toBe('feat_auth');
    expect(candidates[0].proposedType).toBe('VERIFIES');
    expect(candidates[0].score).toBeLessThanOrEqual(0.65); // Supporting evidence constraint
  });
});
