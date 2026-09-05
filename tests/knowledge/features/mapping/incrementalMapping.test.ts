import { describe, it, expect } from 'vitest';
import { FeatureMappingEngine } from '../../../../src/knowledge/features/mapping/core/FeatureMappingEngine';
import { FeatureRegistry } from '../../../../src/knowledge/features/core/FeatureRegistry';
import { FeatureMappingRepository } from '../../../../src/knowledge/features/mapping/repository/FeatureMappingRepository';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { MappingContext } from '../../../../src/knowledge/features/mapping/interfaces/IFeatureMappingSource';

describe('Feature-to-Code Mapping: Incremental Mapping', () => {
  it('should re-evaluate only the affected feature when a resource changes, leaving untouched features intact', async () => {
    const registry = new FeatureRegistry();
    const repository = new FeatureMappingRepository();
    const engine = new FeatureMappingEngine(registry, repository);

    const authFeature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });
    const billingFeature = createDefaultFeature('feat_billing', 'Billing', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });
    registry.registerSync(authFeature);
    registry.registerSync(billingFeature);

    const initialContext: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      symbols: [
        {
          id: 'sym_auth_svc',
          name: 'AuthService',
          kind: 'ClassDeclaration',
          filePath: 'src/auth/AuthService.ts',
        },
        {
          id: 'sym_billing_svc',
          name: 'BillingService',
          kind: 'ClassDeclaration',
          filePath: 'src/billing/BillingService.ts',
        },
      ],
    };

    // 1. Initial full mapping of both features
    await engine.mapFeature('feat_auth', initialContext);
    await engine.mapFeature('feat_billing', initialContext);

    const initialAuthMappings = await engine.getMappings('feat_auth');
    const initialBillingMappings = await engine.getMappings('feat_billing');

    expect(initialAuthMappings.length).toBeGreaterThanOrEqual(1);
    expect(initialBillingMappings.length).toBeGreaterThanOrEqual(1);
    const billingMappingIds = initialBillingMappings.map((m) => m.mappingId);
    const billingVersions = initialBillingMappings.map((m) => m.mappingVersion);

    // 2. Incremental mapping triggered by a change in AuthService.ts only
    const incrementalContext: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      symbols: [
        {
          id: 'sym_auth_svc',
          name: 'AuthService',
          kind: 'ClassDeclaration',
          filePath: 'src/auth/AuthService.ts',
        },
        {
          id: 'sym_auth_ctrl',
          name: 'AuthController',
          kind: 'ClassDeclaration',
          filePath: 'src/auth/AuthController.ts',
        },
      ],
    };

    const incResult = await engine.mapIncremental(['sym_auth_svc'], incrementalContext);

    // Verify only feat_auth was re-evaluated
    expect(incResult.statistics.sourcesExecuted).toBe(1);

    // Verify auth mappings got updated/added
    const updatedAuthMappings = await engine.getMappings('feat_auth');
    expect(updatedAuthMappings.length).toBeGreaterThanOrEqual(1);

    // Verify billing mapping was completely untouched
    const currentBillingMappings = await engine.getMappings('feat_billing');
    expect(currentBillingMappings.map((m) => m.mappingId)).toEqual(billingMappingIds);
    expect(currentBillingMappings.map((m) => m.mappingVersion)).toEqual(billingVersions);
  });
});
