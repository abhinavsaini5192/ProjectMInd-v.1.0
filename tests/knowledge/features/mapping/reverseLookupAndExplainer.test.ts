import { describe, it, expect } from 'vitest';
import { FeatureMappingEngine } from '../../../../src/knowledge/features/mapping/core/FeatureMappingEngine';
import { FeatureRegistry } from '../../../../src/knowledge/features/core/FeatureRegistry';
import { FeatureMappingRepository } from '../../../../src/knowledge/features/mapping/repository/FeatureMappingRepository';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { MappingContext } from '../../../../src/knowledge/features/mapping/interfaces/IFeatureMappingSource';

describe('Feature-to-Code Mapping: Reverse Lookup & Explainability', () => {
  it('should perform bidirectional reverse lookups and provide structured explainability without raw chain-of-thought', async () => {
    const registry = new FeatureRegistry();
    const repository = new FeatureMappingRepository();
    const engine = new FeatureMappingEngine(registry, repository);

    const authFeature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });
    registry.registerSync(authFeature);

    const context: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      symbols: [
        {
          id: 'sym_auth_svc',
          name: 'AuthService',
          kind: 'ClassDeclaration',
          filePath: 'src/auth/AuthService.ts',
        },
      ],
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/auth/login',
          filePath: 'src/auth/AuthController.ts',
        },
      ],
    };

    await engine.mapFeature('feat_auth', context);

    // 1. Reverse lookup
    const linkedFeatures = await engine.getResourceFeatures('sym_auth_svc');
    expect(linkedFeatures).toContain('feat_auth');

    // 2. Explainability
    const mappings = await engine.getMappings('feat_auth');
    const svcMapping = mappings.find((m) => m.resourceId === 'sym_auth_svc');
    expect(svcMapping).toBeDefined();

    const explanation = await engine.explainMapping(svcMapping!.mappingId);

    expect(explanation.mappingId).toBe(svcMapping!.mappingId);
    expect(explanation.featureId).toBe('feat_auth');
    expect(explanation.resourceId).toBe('sym_auth_svc');
    expect(explanation.role).toBe('IMPLEMENTATION');
    expect(explanation.evidenceCount).toBeGreaterThan(0);
    expect(explanation.evidenceSummary.length).toBeGreaterThan(0);
    expect(explanation.reasoningSummary).toContain('AuthService');
    expect(explanation.reasoningSummary).toContain('Authentication');

    // Ensure explainability is structured and free of internal LLM scratchpads
    expect(explanation.reasoningSummary).not.toContain('assistant:');
    expect(explanation.reasoningSummary).not.toContain('<thought>');
  });
});
