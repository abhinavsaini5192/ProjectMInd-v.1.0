import { describe, it, expect } from 'vitest';
import { FeatureMappingRepository } from '../../../../src/knowledge/features/mapping/repository/FeatureMappingRepository';
import type { FeatureResourceMapping } from '../../../../src/knowledge/features/mapping/models/FeatureResourceMapping';

describe('Feature-to-Code Mapping: Shared Resource Multi-Feature Mapping', () => {
  const repository = new FeatureMappingRepository();

  it('should support many-to-many mappings where a single resource serves multiple features with distinct roles', async () => {
    const resourceId = 'src/users/UserRepository.ts';

    // 1. Authentication feature uses UserRepository for credential/session persistence
    const authMapping: FeatureResourceMapping = {
      mappingId: 'map_auth_user_repo',
      featureId: 'feat_auth',
      resourceId,
      resourceType: 'FILE',
      role: 'STORAGE',
      confidence: { level: 'HIGH', score: 0.85, reasons: ['User repository stores authentication credentials'] },
      score: 0.85,
      evidence: [],
      source: 'DISCOVERED',
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      knowledgeVersion: '1.0.0',
      mappingVersion: 1,
      active: true,
    };

    // 2. User Management feature implements core user profiles and lifecycle via UserRepository
    const userMapping: FeatureResourceMapping = {
      mappingId: 'map_user_user_repo',
      featureId: 'feat_user_mgmt',
      resourceId,
      resourceType: 'FILE',
      role: 'IMPLEMENTATION',
      confidence: { level: 'VERY_HIGH', score: 0.95, reasons: ['Primary implementation for user entity management'] },
      score: 0.95,
      evidence: [],
      source: 'DISCOVERED',
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      knowledgeVersion: '1.0.0',
      mappingVersion: 1,
      active: true,
    };

    await repository.save(authMapping);
    await repository.save(userMapping);

    // Verify reverse lookup
    const linkedFeatures = await repository.getResourceFeatures(resourceId);
    expect(linkedFeatures).toHaveLength(2);
    expect(linkedFeatures).toContain('feat_auth');
    expect(linkedFeatures).toContain('feat_user_mgmt');

    // Verify distinct roles
    const authMappings = await repository.getMappings('feat_auth');
    expect(authMappings).toHaveLength(1);
    expect(authMappings[0]!.role).toBe('STORAGE');

    const userMappings = await repository.getMappings('feat_user_mgmt');
    expect(userMappings).toHaveLength(1);
    expect(userMappings[0]!.role).toBe('IMPLEMENTATION');

    // Deactivate auth mapping and verify user management mapping remains active
    await repository.deactivate('map_auth_user_repo', 'FEATURE_SPLIT');
    const remainingFeatures = await repository.getResourceFeatures(resourceId);
    expect(remainingFeatures).toHaveLength(1);
    expect(remainingFeatures).toContain('feat_user_mgmt');
    expect(remainingFeatures).not.toContain('feat_auth');
  });
});
