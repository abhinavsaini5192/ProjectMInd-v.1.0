import { describe, it, expect } from 'vitest';
import { FeatureMappingEngine } from '../../../../src/knowledge/features/mapping/core/FeatureMappingEngine';
import { FeatureRegistry } from '../../../../src/knowledge/features/core/FeatureRegistry';
import { FeatureMappingRepository } from '../../../../src/knowledge/features/mapping/repository/FeatureMappingRepository';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { FeatureResourceMapping } from '../../../../src/knowledge/features/mapping/models/FeatureResourceMapping';
import type { MappingContext } from '../../../../src/knowledge/features/mapping/interfaces/IFeatureMappingSource';

describe('Feature-to-Code Mapping: Manual Mapping Protection', () => {
  it('should strictly protect manual mappings from being overwritten or deleted while enriching with discovery evidence', async () => {
    const registry = new FeatureRegistry();
    const repository = new FeatureMappingRepository();
    const engine = new FeatureMappingEngine(registry, repository);

    const authFeature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });
    registry.registerSync(authFeature);

    const resourceId = 'src/auth/CustomAuthGateway.ts';

    // 1. User created a manual mapping with role = 'ENTRY_POINT'
    const manualMapping: FeatureResourceMapping = {
      mappingId: 'map_manual_gateway',
      featureId: 'feat_auth',
      resourceId,
      resourceType: 'FILE',
      role: 'ENTRY_POINT', // Explicit user intent
      confidence: {
        level: 'VERY_HIGH',
        score: 1.0,
        reasons: ['Manually established by developer'],
      },
      score: 1.0,
      evidence: [
        {
          evidenceId: 'ev_manual_init',
          sourceType: 'FILE',
          sourceId: resourceId,
          evidenceType: 'MANUAL_USER_ASSERTION',
          description: 'Developer pinned this gateway as primary entrypoint',
          strength: 1.0,
          confidence: 1.0,
          metadata: { author: 'architect' },
          timestamp: Date.now(),
        },
      ],
      source: 'MANUAL',
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      knowledgeVersion: '1.0.0',
      mappingVersion: 1,
      active: true,
    };

    await repository.save(manualMapping);

    // 2. Automated discovery runs and finds CustomAuthGateway as a regular SUPPORT or IMPLEMENTATION file
    const context: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      symbols: [
        {
          id: resourceId,
          name: 'CustomAuthGateway',
          kind: 'ClassDeclaration',
          filePath: resourceId,
        },
      ],
    };

    const result = await engine.mapFeature('feat_auth', context);

    const mappings = await engine.getMappings('feat_auth');
    const gatewayMapping = mappings.find((m) => m.resourceId === resourceId);

    expect(gatewayMapping).toBeDefined();
    // 1. Provenance is preserved
    expect(gatewayMapping?.source).toBe('MANUAL');
    // 2. Mapping ID is preserved
    expect(gatewayMapping?.mappingId).toBe('map_manual_gateway');
    // 3. User-defined role is strictly preserved
    expect(gatewayMapping?.role).toBe('ENTRY_POINT');
    // 4. Evidence is enriched
    expect(gatewayMapping?.evidence.length).toBeGreaterThanOrEqual(2);
    expect(gatewayMapping?.evidence.some((e) => e.evidenceId === 'ev_manual_init')).toBe(true);
    // 5. Version incremented
    expect(gatewayMapping?.mappingVersion).toBe(2);
    // 6. Never deactivated
    expect(gatewayMapping?.active).toBe(true);
  });
});
