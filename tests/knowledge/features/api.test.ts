import { describe, it, expect, vi } from 'vitest';
import { FeatureRegistry } from '../../../src/knowledge/features/core/FeatureRegistry';
import { FeatureAPI } from '../../../src/knowledge/features/core/FeatureAPI';
import { KernelEventDispatcher } from '../../../src/kernel/core/KernelEventDispatcher';
import { FeatureType } from '../../../src/knowledge/features/models/FeatureType';

describe('FeatureAPI Integration', () => {
  it('should create, update, delete features and dispatch kernel events', async () => {
    const registry = new FeatureRegistry();
    const dispatcher = new KernelEventDispatcher();
    const publishSpy = vi.spyOn(dispatcher, 'publish');

    const api = new FeatureAPI(registry, dispatcher);

    const feat = await api.createFeature('User Notifications', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1'
    }, {
      type: FeatureType.USER_FACING
    });

    expect(feat.id).toBeDefined();
    expect(publishSpy).toHaveBeenCalledWith('FEATURE_CREATED', expect.objectContaining({
      featureId: feat.id,
      repositoryId: 'repo-1'
    }));

    const found = await api.findFeatures({ name: 'User Notifications' });
    expect(found.length).toBe(1);
    expect(found[0].id).toBe(feat.id);

    await api.deleteFeature(feat.id);
    expect(publishSpy).toHaveBeenCalledWith('FEATURE_DELETED', expect.objectContaining({
      featureId: feat.id
    }));

    const afterDelete = await registry.has(feat.id);
    expect(afterDelete).toBe(false);
  });
});
