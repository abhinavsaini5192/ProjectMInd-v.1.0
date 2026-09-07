import { describe, it, expect } from 'vitest';
import { BehaviorTestHelper } from './BehaviorTestHelper';
import type { FeatureBehavior } from '../../../../src/knowledge/features/behavior/models/FeatureBehavior';
import { FeatureBehaviorRepository } from '../../../../src/knowledge/features/behavior/repository/FeatureBehaviorRepository';
import { FeatureBehaviorEngine } from '../../../../src/knowledge/features/behavior/core/FeatureBehaviorEngine';

describe('Phase 6.5: Incremental Flow Analysis', () => {
  it('should re-evaluate only features directly or indirectly affected by changed resources', async () => {
    const authFeature = BehaviorTestHelper.createFeature('feat_auth_inc', 'Auth');
    const catalogFeature = BehaviorTestHelper.createFeature('feat_catalog_inc', 'Catalog');

    const authMappings = [
      BehaviorTestHelper.createMapping('feat_auth_inc', 'AuthService.login', 'SYMBOL', 'SERVICE'),
      BehaviorTestHelper.createMapping('feat_auth_inc', 'POST /login', 'ENDPOINT', 'PRIMARY'),
    ];

    const catalogMappings = [
      BehaviorTestHelper.createMapping('feat_catalog_inc', 'ProductService.list', 'SYMBOL', 'SERVICE'),
      BehaviorTestHelper.createMapping('feat_catalog_inc', 'GET /products', 'ENDPOINT', 'PRIMARY'),
    ];

    const allMappings = new Map([
      ['feat_auth_inc', authMappings],
      ['feat_catalog_inc', catalogMappings],
    ]);

    const context = BehaviorTestHelper.createContext(authFeature, authMappings, {
      allFeatures: [authFeature, catalogFeature],
      allMappings,
    });

    const repository = new FeatureBehaviorRepository();
    const engine = new FeatureBehaviorEngine(repository);

    // Initial batch analysis
    await engine.analyzeBatch(['feat_auth_inc', 'feat_catalog_inc'], context);

    const initialCatalogBeh = await repository.getBehavior('feat_catalog_inc');
    expect(initialCatalogBeh).toBeDefined();
    const catalogInitialUpdatedAt = initialCatalogBeh?.updatedAt;

    // Small delay to ensure timestamp differences
    await new Promise(r => setTimeout(r, 20));

    // Incremental run: only AuthService.login changed
    const incrementalResult = await engine.analyzeIncremental(['AuthService.login'], context);

    // Verify only feat_auth_inc was re-analyzed
    expect(incrementalResult.statistics.featuresAnalyzed).toBe(1);
    expect(incrementalResult.behaviors.some(b => b.featureId === 'feat_auth_inc')).toBe(true);
    expect(incrementalResult.behaviors.some(b => b.featureId === 'feat_catalog_inc')).toBe(false);

    // Verify catalog behavior was untouched in repository
    const postCatalogBeh = await repository.getBehavior('feat_catalog_inc');
    expect(postCatalogBeh?.updatedAt).toBe(catalogInitialUpdatedAt);
  });
});
