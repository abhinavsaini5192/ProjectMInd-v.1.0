import { describe, it, expect } from 'vitest';
import { ModuleDependencySource } from '../../../../src/knowledge/features/dependencies/sources/ModuleDependencySource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { DependencyContext } from '../../../../src/knowledge/features/dependencies/interfaces/IFeatureRelationshipSource';

describe('Feature Dependency Graph: ModuleDependencySource', () => {
  const source = new ModuleDependencySource();
  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
  const featAuth = createDefaultFeature('feat_auth' as any, 'Authentication', scope);
  const featUser = createDefaultFeature('feat_user' as any, 'User Management', scope);
  const allFeatures = [featAuth, featUser];

  it('should detect DEPENDS_ON from cross-module dependencies', () => {
    const context: DependencyContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      featureMappings: [
        {
          mappingId: 'm_mod_auth',
          featureId: 'feat_auth',
          resourceId: 'src/auth',
          resourceType: 'MODULE',
          role: 'ENTRY_POINT',
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
          mappingId: 'm_mod_user',
          featureId: 'feat_user',
          resourceId: 'src/users',
          resourceType: 'MODULE',
          role: 'ENTRY_POINT',
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
      modules: [
        {
          id: 'mod_auth',
          name: 'auth',
          path: 'src/auth',
          dependencies: ['src/users'],
        } as any,
      ],
    };

    const candidates = source.discoverRelationships(featAuth, allFeatures, context);
    expect(candidates.length).toBe(1);
    expect(candidates[0].sourceFeatureId).toBe('feat_auth');
    expect(candidates[0].targetFeatureId).toBe('feat_user');
    expect(candidates[0].proposedType).toBe('DEPENDS_ON');
    expect(candidates[0].evidence[0].sourceType).toBe('MODULE');
  });
});
