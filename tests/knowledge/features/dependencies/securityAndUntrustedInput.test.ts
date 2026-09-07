import { describe, it, expect } from 'vitest';
import { FeatureDependencyEngine } from '../../../../src/knowledge/features/dependencies/core/FeatureDependencyEngine';
import { FeatureRegistry } from '../../../../src/knowledge/features/core/FeatureRegistry';
import { FeatureRelationshipRepository } from '../../../../src/knowledge/features/dependencies/repository/FeatureRelationshipRepository';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';

describe('Feature Dependency Graph: Security and Untrusted Input', () => {
  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
  const featAuth = createDefaultFeature('feat_auth' as any, 'Authentication', scope);

  it('should gracefully handle malformed, null, or empty context objects without throwing', async () => {
    const registry = new FeatureRegistry();
    const repository = new FeatureRelationshipRepository();
    registry.register(featAuth);

    const engine = new FeatureDependencyEngine(registry, repository);

    // Completely empty / minimal context
    const res1 = await engine.discoverRelationships('feat_auth', undefined);
    expect(res1.relationships.length).toBe(0);
    expect(res1.statistics.featuresEvaluated).toBe(1);

    // Corrupted/empty arrays context
    const res2 = await engine.discoverRelationships('feat_auth', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      endpoints: [],
      dependencies: [],
      configurations: [],
      history: [],
      tests: [],
      databaseEntities: [],
    });
    expect(res2.relationships.length).toBe(0);
  });

  it('should prevent path traversal or injection in resource IDs', async () => {
    const registry = new FeatureRegistry();
    const repository = new FeatureRelationshipRepository();
    registry.register(featAuth);

    const engine = new FeatureDependencyEngine(registry, repository);
    const result = await engine.updateIncremental(['../../etc/passwd', '..\\..\\windows\\system32'], {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });

    expect(result.statistics.featuresEvaluated).toBe(0);
    expect(result.relationships.length).toBe(0);
  });
});
