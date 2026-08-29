import { describe, it, expect } from 'vitest';
import { FeatureRegistry } from '../../../src/knowledge/features/core/FeatureRegistry';
import { FeatureAPI } from '../../../src/knowledge/features/core/FeatureAPI';
import { FeatureReference } from '../../../src/knowledge/features/models/FeatureReference';

describe('Feature References', () => {
  it('should add and remove non-destructive references to symbols and files', async () => {
    const registry = new FeatureRegistry();
    const api = new FeatureAPI(registry);

    const feature = await api.createFeature('Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1'
    });

    const ref1: FeatureReference = {
      referenceId: 'ref_1',
      resourceType: 'SYMBOL',
      resourceId: 'AuthService',
      role: 'IMPLEMENTATION',
      confidence: 0.95
    };

    const ref2: FeatureReference = {
      referenceId: 'ref_2',
      resourceType: 'TEST',
      resourceId: 'tests/auth.test.ts',
      role: 'VERIFICATION',
      confidence: 0.9
    };

    await api.addReference(feature.id, ref1);
    await api.addReference(feature.id, ref2);

    const updated = await api.getFeature(feature.id);
    expect(updated.references.length).toBe(2);

    await api.removeReference(feature.id, 'ref_1');
    const afterRemoval = await api.getFeature(feature.id);
    expect(afterRemoval.references.length).toBe(1);
    expect(afterRemoval.references[0].referenceId).toBe('ref_2');
  });
});
