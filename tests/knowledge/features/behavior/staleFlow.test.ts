import { describe, it, expect } from 'vitest';
import { BehaviorTestHelper } from './BehaviorTestHelper';
import { FeatureBehaviorRepository } from '../../../../src/knowledge/features/behavior/repository/FeatureBehaviorRepository';
import { FeatureBehaviorEngine } from '../../../../src/knowledge/features/behavior/core/FeatureBehaviorEngine';

describe('Phase 6.5: Versioning and Stale Flow Management', () => {
  it('should increment behavior version on update and manage flow lifecycle in repository', async () => {
    const feat = BehaviorTestHelper.createFeature('feat_versioning', 'Versioning Test');
    const repository = new FeatureBehaviorRepository();
    const engine = new FeatureBehaviorEngine(repository);

    // Initial version with v1 endpoint
    const mappingsV1 = [
      BehaviorTestHelper.createMapping('feat_versioning', 'POST /api/v1/login', 'ENDPOINT', 'PRIMARY'),
      BehaviorTestHelper.createMapping('feat_versioning', 'AuthController.loginV1', 'SYMBOL', 'CONTROLLER'),
    ];

    const ctx1 = BehaviorTestHelper.createContext(feat, mappingsV1);
    const res1 = await engine.analyzeFeatureBehavior('feat_versioning', ctx1);

    expect(res1.newBehaviors.length).toBe(1);
    expect(res1.updatedBehaviors.length).toBe(0);
    expect(res1.behaviors[0].behaviorVersion).toBe(1);

    const oldFlowId = res1.behaviors[0].flows[0].flowId;
    const storedFlow = await repository.getFlow(oldFlowId);
    expect(storedFlow).toBeDefined();

    // Refactored version with v2 endpoint
    const mappingsV2 = [
      BehaviorTestHelper.createMapping('feat_versioning', 'POST /api/v2/login', 'ENDPOINT', 'PRIMARY'),
      BehaviorTestHelper.createMapping('feat_versioning', 'AuthController.loginV2', 'SYMBOL', 'CONTROLLER'),
    ];

    const ctx2 = BehaviorTestHelper.createContext(feat, mappingsV2);
    const res2 = await engine.analyzeFeatureBehavior('feat_versioning', ctx2);

    expect(res2.newBehaviors.length).toBe(0);
    expect(res2.updatedBehaviors.length).toBe(1);
    expect(res2.behaviors[0].behaviorVersion).toBe(2);

    // Delete behavior
    const deleted = await repository.deleteBehavior('feat_versioning');
    expect(deleted).toBe(true);
    expect(await repository.getBehavior('feat_versioning')).toBeNull();
  });
});
