import { describe, it, expect } from 'vitest';
import { SharedResourceSource } from '../../../../src/knowledge/features/dependencies/sources/SharedResourceSource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { DependencyContext } from '../../../../src/knowledge/features/dependencies/interfaces/IFeatureRelationshipSource';

describe('Feature Dependency Graph: SharedResourceSource', () => {
  const source = new SharedResourceSource();
  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
  const featAuth = createDefaultFeature('feat_auth' as any, 'Authentication', scope);
  const featUser = createDefaultFeature('feat_user' as any, 'User Management', scope);
  const allFeatures = [featAuth, featUser];

  it('should infer SHARES_RESOURCE when technical assets are mapped across multiple features', () => {
    const sharedAsset = 'src/models/UserModel.ts';
    const context: DependencyContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      featureMappings: [
        {
          mappingId: 'm1',
          featureId: 'feat_auth',
          resourceId: sharedAsset,
          resourceType: 'FILE',
          role: 'STORAGE',
          confidence: { level: 'HIGH', score: 0.85, reasons: [] },
          score: 0.85,
          evidence: [],
          source: 'DISCOVERED',
          scope,
          createdAt: 0,
          updatedAt: 0,
          knowledgeVersion: '2.0.0',
          mappingVersion: 1,
          active: true,
        },
        {
          mappingId: 'm2',
          featureId: 'feat_user',
          resourceId: sharedAsset,
          resourceType: 'FILE',
          role: 'IMPLEMENTATION',
          confidence: { level: 'VERY_HIGH', score: 0.95, reasons: [] },
          score: 0.95,
          evidence: [],
          source: 'DISCOVERED',
          scope,
          createdAt: 0,
          updatedAt: 0,
          knowledgeVersion: '2.0.0',
          mappingVersion: 1,
          active: true,
        },
      ],
    };

    const candidates = source.discoverRelationships(featAuth, allFeatures, context);
    expect(candidates.length).toBe(1);
    expect(candidates[0].proposedType).toBe('SHARES_RESOURCE');
    expect(candidates[0].direction).toBe('BIDIRECTIONAL');
    expect(candidates[0].proposedType).not.toBe('DEPENDS_ON');
    expect(candidates[0].evidence[0].sourceType).toBe('SHARED_RESOURCE');
  });
});
