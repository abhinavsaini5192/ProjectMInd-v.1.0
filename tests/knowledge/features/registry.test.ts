import { describe, it, expect } from 'vitest';
import { FeatureRegistry } from '../../../src/knowledge/features/core/FeatureRegistry';
import { createDefaultFeature } from '../../../src/knowledge/features/models/Feature';
import { FeatureType } from '../../../src/knowledge/features/models/FeatureType';
import { DuplicateFeatureError } from '../../../src/knowledge/features/errors/DuplicateFeatureError';

describe('Feature Registry', () => {
  it('should register, retrieve, list, and delete features', async () => {
    const registry = new FeatureRegistry();
    const feat = createDefaultFeature('feat_search_12345678', 'Global Search', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1'
    }, { type: FeatureType.USER_FACING });

    await registry.register(feat);

    expect(await registry.has(feat.id)).toBe(true);
    const retrieved = await registry.get(feat.id);
    expect(retrieved?.name).toBe('Global Search');

    const byName = await registry.findByName('Global Search');
    expect(byName.length).toBe(1);

    const byType = await registry.findByType(FeatureType.USER_FACING);
    expect(byType.length).toBe(1);

    await expect(registry.register(feat)).rejects.toThrow(DuplicateFeatureError);

    await registry.remove(feat.id);
    expect(await registry.has(feat.id)).toBe(false);
  });
});
