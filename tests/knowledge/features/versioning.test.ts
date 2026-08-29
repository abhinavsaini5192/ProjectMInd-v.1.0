import { describe, it, expect } from 'vitest';
import { FeatureRegistry } from '../../../src/knowledge/features/core/FeatureRegistry';
import { FeatureAPI } from '../../../src/knowledge/features/core/FeatureAPI';

describe('Feature Versioning & Immutability', () => {
  it('should preserve stable FeatureId across renames and record version history', async () => {
    const registry = new FeatureRegistry();
    const api = new FeatureAPI(registry);

    const initial = await api.createFeature('Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1'
    });

    const initialId = initial.id;

    const renamed = await api.renameFeature(initialId, 'User Authentication');
    expect(renamed.id).toBe(initialId); // ID remains stable!
    expect(renamed.name).toBe('User Authentication');
    expect(renamed.version).toBe(2);

    const history = api.getFeatureHistory(initialId);
    expect(history.length).toBe(2);
    expect(history[0].changeType).toBe('CREATED');
    expect(history[1].changeType).toBe('RENAMED');
    expect(history[1].previousName).toBe('Authentication');
  });
});
