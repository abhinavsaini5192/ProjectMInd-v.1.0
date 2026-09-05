import { describe, it, expect } from 'vitest';
import { DatabaseMappingSource } from '../../../../src/knowledge/features/mapping/sources/DatabaseMappingSource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { MappingContext } from '../../../../src/knowledge/features/mapping/interfaces/IFeatureMappingSource';

describe('Feature-to-Code Mapping: DatabaseMappingSource', () => {
  const source = new DatabaseMappingSource();

  it('should map database entities and storage symbols, supporting shared multi-feature entities', () => {
    const authFeature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });

    const userFeature = createDefaultFeature('feat_user', 'User Management', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });

    const context: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      databaseEntities: [
        {
          entityId: 'entity_users',
          name: 'users',
          tableName: 'users_table',
          fields: ['id', 'email', 'password_hash', 'created_at'],
        },
        {
          entityId: 'entity_sessions',
          name: 'auth_sessions',
          tableName: 'sessions_table',
          fields: ['session_id', 'user_id', 'expires_at'],
        },
      ],
      symbols: [
        {
          id: 'sym_user_repo',
          name: 'UserRepository',
          kind: 'ClassDeclaration',
          filePath: 'src/users/UserRepository.ts',
        },
      ],
    };

    // 1. Authentication feature mapping
    const authCandidates = source.mapFeature(authFeature, context);
    // Should map sessions (STORAGE), users (STORAGE), and UserRepository (STORAGE)
    const authResourceIds = authCandidates.map((c) => c.resourceId);
    expect(authResourceIds).toContain('entity_sessions');
    expect(authResourceIds).toContain('entity_users');
    expect(authResourceIds).toContain('sym_user_repo');

    const authUserEntity = authCandidates.find((c) => c.resourceId === 'entity_users');
    expect(authUserEntity?.proposedRole).toBe('STORAGE');

    const authUserRepo = authCandidates.find((c) => c.resourceId === 'sym_user_repo');
    expect(authUserRepo?.proposedRole).toBe('STORAGE');

    // 2. User Management feature mapping
    const userCandidates = source.mapFeature(userFeature, context);
    const userResourceIds = userCandidates.map((c) => c.resourceId);
    expect(userResourceIds).toContain('entity_users');
    expect(userResourceIds).toContain('sym_user_repo');

    const userEntityCand = userCandidates.find((c) => c.resourceId === 'entity_users');
    expect(userEntityCand?.proposedRole).toBe('IMPLEMENTATION');

    const userRepoCand = userCandidates.find((c) => c.resourceId === 'sym_user_repo');
    expect(userRepoCand?.proposedRole).toBe('IMPLEMENTATION');
  });
});
