import { describe, it, expect } from 'vitest';
import { HistoryRelationshipSource } from '../../../../src/knowledge/features/dependencies/sources/HistoryRelationshipSource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { DependencyContext } from '../../../../src/knowledge/features/dependencies/interfaces/IFeatureRelationshipSource';

describe('Feature Dependency Graph: HistoryRelationshipSource', () => {
  const source = new HistoryRelationshipSource();
  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
  const featBilling = createDefaultFeature('feat_billing' as any, 'Billing', scope);
  const featAuth = createDefaultFeature('feat_auth' as any, 'Authentication', scope);
  const allFeatures = [featBilling, featAuth];

  it('should detect ASSOCIATED_WITH from co-change commit history with low confidence', () => {
    const context: DependencyContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      featureMappings: [
        {
          mappingId: 'm1',
          featureId: 'feat_billing',
          resourceId: 'src/billing/BillingService.ts',
          resourceType: 'FILE',
          role: 'IMPLEMENTATION',
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
        {
          mappingId: 'm2',
          featureId: 'feat_auth',
          resourceId: 'src/auth/AuthService.ts',
          resourceType: 'FILE',
          role: 'IMPLEMENTATION',
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
      history: [
        {
          commitHash: 'abc1234',
          author: 'dev@example.com',
          message: 'feat: update auth session handling in billing checkout',
          timestamp: 1000,
          changedFiles: ['src/billing/BillingService.ts', 'src/auth/AuthService.ts'],
        } as any,
      ],
    };

    const candidates = source.discoverRelationships(featBilling, allFeatures, context);
    expect(candidates.length).toBe(1);
    expect(candidates[0].proposedType).toBe('ASSOCIATED_WITH');
    expect(candidates[0].direction).toBe('UNDIRECTED');
    expect(candidates[0].score).toBeLessThanOrEqual(0.4);
    expect(candidates[0].confidence.level).toBe('LOW');
  });
});
