import { describe, it, expect } from 'vitest';
import { FeatureMappingEngine } from '../../../../src/knowledge/features/mapping/core/FeatureMappingEngine';
import { FeatureRegistry } from '../../../../src/knowledge/features/core/FeatureRegistry';
import { FeatureMappingRepository } from '../../../../src/knowledge/features/mapping/repository/FeatureMappingRepository';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { FeatureResourceMapping } from '../../../../src/knowledge/features/mapping/models/FeatureResourceMapping';
import type { MappingContext } from '../../../../src/knowledge/features/mapping/interfaces/IFeatureMappingSource';

describe('Feature-to-Code Mapping: Stale Mapping Deactivation', () => {
  it('should deactivate stale mappings when resources disappear from codebase while preserving history', async () => {
    const registry = new FeatureRegistry();
    const repository = new FeatureMappingRepository();
    const engine = new FeatureMappingEngine(registry, repository);

    const authFeature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });
    registry.registerSync(authFeature);

    // 1. Existing mapping for LegacyAuthService that is about to be deleted
    const legacyMapping: FeatureResourceMapping = {
      mappingId: 'map_legacy_auth',
      featureId: 'feat_auth',
      resourceId: 'src/auth/LegacyAuthService.ts',
      resourceType: 'FILE',
      role: 'IMPLEMENTATION',
      confidence: { level: 'HIGH', score: 0.8, reasons: ['Old auth service'] },
      score: 0.8,
      evidence: [],
      source: 'DISCOVERED',
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      createdAt: Date.now() - 10000,
      updatedAt: Date.now() - 10000,
      knowledgeVersion: '1.0.0',
      mappingVersion: 1,
      active: true,
    };

    await repository.save(legacyMapping);

    // 2. New context only contains NewAuthService (LegacyAuthService was removed)
    const currentContext: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      symbols: [
        {
          id: 'sym_new_auth',
          name: 'NewAuthService',
          kind: 'ClassDeclaration',
          filePath: 'src/auth/NewAuthService.ts',
        },
      ],
    };

    const result = await engine.mapFeature('feat_auth', currentContext);

    // Verify deactivation in result statistics
    expect(result.deactivatedMappings).toHaveLength(1);
    expect(result.deactivatedMappings[0]!.mappingId).toBe('map_legacy_auth');
    expect(result.statistics.mappingsDeactivated).toBe(1);

    // Verify repository state: active mappings should NOT contain legacy mapping
    const activeMappings = await engine.getMappings('feat_auth');
    expect(activeMappings.some((m) => m.mappingId === 'map_legacy_auth')).toBe(false);

    // Verify record was preserved in repository with active: false and reason
    const storedRecord = await repository.get('map_legacy_auth');
    expect(storedRecord).toBeDefined();
    expect(storedRecord?.active).toBe(false);
    expect(storedRecord?.deactivationReason).toBe('RESOURCE_REMOVED');
  });
});
