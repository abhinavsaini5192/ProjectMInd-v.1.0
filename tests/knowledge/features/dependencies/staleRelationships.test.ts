import { describe, it, expect } from 'vitest';
import { FeatureDependencyEngine } from '../../../../src/knowledge/features/dependencies/core/FeatureDependencyEngine';
import { FeatureRegistry } from '../../../../src/knowledge/features/core/FeatureRegistry';
import { FeatureRelationshipRepository } from '../../../../src/knowledge/features/dependencies/repository/FeatureRelationshipRepository';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { DependencyContext } from '../../../../src/knowledge/features/dependencies/interfaces/IFeatureRelationshipSource';

describe('Feature Dependency Graph: Stale Relationship Deactivation', () => {
  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
  const featBilling = createDefaultFeature('feat_billing' as any, 'Billing', scope);
  const featAuth = createDefaultFeature('feat_auth' as any, 'Authentication', scope);

  it('should deactivate existing relationship when connection is no longer detected', async () => {
    const registry = new FeatureRegistry();
    const repository = new FeatureRelationshipRepository();
    registry.register(featBilling);
    registry.register(featAuth);

    // Initial state: dependency exists
    const contextWithDep: DependencyContext = {
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
    const initialRun = await engine.discoverRelationships('feat_billing', contextWithDep);
    expect(initialRun.newRelationships.length).toBe(1);
    const relId = initialRun.newRelationships[0].relationshipId;

    // Second run: dependency is removed from context
    const contextWithoutDep: DependencyContext = {
      ...contextWithDep,
      dependencies: [], // Removed!
    };

    const updateRun = await engine.discoverRelationships('feat_billing', contextWithoutDep);
    expect(updateRun.deactivatedRelationships.length).toBe(1);
    expect(updateRun.deactivatedRelationships[0].relationshipId).toBe(relId);

    // Verify repository state
    const stored = await repository.get(relId);
    expect(stored?.active).toBe(false);
    expect(stored?.deactivationReason).toBe('RELATIONSHIP_REMOVED');

    // Verify graph state
    expect(engine.getGraph().hasRelationship('feat_billing', 'feat_auth')).toBe(false);
  });
});
