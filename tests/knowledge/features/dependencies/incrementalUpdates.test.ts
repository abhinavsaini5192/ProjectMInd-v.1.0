import { describe, it, expect } from 'vitest';
import { FeatureDependencyEngine } from '../../../../src/knowledge/features/dependencies/core/FeatureDependencyEngine';
import { FeatureRegistry } from '../../../../src/knowledge/features/core/FeatureRegistry';
import { FeatureRelationshipRepository } from '../../../../src/knowledge/features/dependencies/repository/FeatureRelationshipRepository';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { DependencyContext } from '../../../../src/knowledge/features/dependencies/interfaces/IFeatureRelationshipSource';

describe('Feature Dependency Graph: Incremental Updates', () => {
  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
  const featAuth = createDefaultFeature('feat_auth' as any, 'Authentication', scope);
  const featBilling = createDefaultFeature('feat_billing' as any, 'Billing', scope);
  const featReports = createDefaultFeature('feat_reports' as any, 'Reports', scope);

  it('should re-evaluate only features affected by changed resource IDs', async () => {
    const registry = new FeatureRegistry();
    const repository = new FeatureRelationshipRepository();
    registry.register(featAuth);
    registry.register(featBilling);
    registry.register(featReports);

    const context: DependencyContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      featureMappings: [
        {
          mappingId: 'm_auth',
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
        {
          mappingId: 'm_billing',
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
          mappingId: 'm_reports',
          featureId: 'feat_reports',
          resourceId: 'src/reports/ReportService.ts',
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
      dependencies: [
        {
          id: 'dep_1',
          sourceId: 'src/billing/BillingService.ts',
          targetId: 'src/auth/AuthService.ts',
          type: 'IMPORT',
          confidence: 0.9,
        } as any,
      ],
    };

    const engine = new FeatureDependencyEngine(registry, repository);

    // Initial incremental run changing only BillingService.ts
    const result = await engine.updateIncremental(['src/billing/BillingService.ts'], context);

    // Only feat_billing should have been evaluated (1 feature, not all 3)
    expect(result.statistics.featuresEvaluated).toBe(1);
    expect(result.relationships.length).toBe(1);
    expect(result.relationships[0].sourceFeatureId).toBe('feat_billing');
    expect(result.relationships[0].targetFeatureId).toBe('feat_auth');
  });
});
