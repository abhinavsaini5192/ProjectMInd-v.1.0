import { describe, it, expect } from 'vitest';
import { CodeDependencySource } from '../../../../src/knowledge/features/dependencies/sources/CodeDependencySource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { DependencyContext } from '../../../../src/knowledge/features/dependencies/interfaces/IFeatureRelationshipSource';

describe('Feature Dependency Graph: CodeDependencySource', () => {
  const source = new CodeDependencySource();
  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
  const featAuth = createDefaultFeature('feat_auth' as any, 'Authentication', scope);
  const featUser = createDefaultFeature('feat_user' as any, 'User Management', scope);
  const allFeatures = [featAuth, featUser];

  it('should project cross-feature file imports into DEPENDS_ON relationships', () => {
    const context: DependencyContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      featureMappings: [
        {
          mappingId: 'map_1',
          featureId: 'feat_auth',
          resourceId: 'src/auth/AuthService.ts',
          resourceType: 'FILE',
          role: 'IMPLEMENTATION',
          confidence: { level: 'HIGH', score: 0.9, reasons: [] },
          score: 0.9,
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
          mappingId: 'map_2',
          featureId: 'feat_user',
          resourceId: 'src/users/UserService.ts',
          resourceType: 'FILE',
          role: 'IMPLEMENTATION',
          confidence: { level: 'HIGH', score: 0.9, reasons: [] },
          score: 0.9,
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
      dependencies: [
        {
          id: 'dep_1',
          sourceId: 'src/auth/AuthService.ts',
          targetId: 'src/users/UserService.ts',
          type: 'IMPORT',
          confidence: 0.88,
        } as any,
      ],
    };

    const candidates = source.discoverRelationships(featAuth, allFeatures, context);
    expect(candidates.length).toBe(1);
    expect(candidates[0].sourceFeatureId).toBe('feat_auth');
    expect(candidates[0].targetFeatureId).toBe('feat_user');
    expect(candidates[0].proposedType).toBe('DEPENDS_ON');
    expect(candidates[0].score).toBe(0.88);
  });

  it('should filter out generic utility libraries (lodash, fs, etc.)', () => {
    const context: DependencyContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      dependencies: [
        {
          id: 'dep_lodash',
          sourceId: 'src/auth/AuthService.ts',
          targetId: 'lodash',
          type: 'IMPORT',
          confidence: 0.99,
        } as any,
        {
          id: 'dep_fs',
          sourceId: 'src/auth/AuthService.ts',
          targetId: 'node:fs',
          type: 'IMPORT',
          confidence: 0.99,
        } as any,
      ],
    };

    const candidates = source.discoverRelationships(featAuth, allFeatures, context);
    expect(candidates.length).toBe(0);
  });
});
