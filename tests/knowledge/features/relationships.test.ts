import { describe, it, expect } from 'vitest';
import { FeatureRegistry } from '../../../src/knowledge/features/core/FeatureRegistry';
import { FeatureAPI } from '../../../src/knowledge/features/core/FeatureAPI';
import { FeatureRelationship } from '../../../src/knowledge/features/models/FeatureRelationship';

describe('Feature Semantic Relationships', () => {
  it('should link features with semantic relationships', async () => {
    const registry = new FeatureRegistry();
    const api = new FeatureAPI(registry);

    const authFeat = await api.createFeature('Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1'
    });

    const userFeat = await api.createFeature('User Management', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1'
    });

    const rel: FeatureRelationship = {
      sourceFeatureId: authFeat.id,
      targetFeatureId: userFeat.id,
      type: 'REQUIRES',
      description: 'Authentication requires User Management for credentials',
      confidence: 1.0
    };

    await api.addRelationship(authFeat.id, rel);
    const updated = await api.getFeature(authFeat.id);
    expect(updated.relationships.length).toBe(1);
    expect(updated.relationships[0].type).toBe('REQUIRES');

    await api.removeRelationship(authFeat.id, userFeat.id);
    const afterRemoval = await api.getFeature(authFeat.id);
    expect(afterRemoval.relationships.length).toBe(0);
  });
});
