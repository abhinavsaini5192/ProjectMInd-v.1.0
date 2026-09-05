import { describe, it, expect } from 'vitest';
import { ConfigurationMappingSource } from '../../../../src/knowledge/features/mapping/sources/ConfigurationMappingSource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { MappingContext } from '../../../../src/knowledge/features/mapping/interfaces/IFeatureMappingSource';

describe('Feature-to-Code Mapping: ConfigurationMappingSource', () => {
  const source = new ConfigurationMappingSource();

  it('should map configuration keys and never expose or store raw secrets', () => {
    const authFeature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });

    const context: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      configurations: [
        {
          key: 'AUTH_JWT_SECRET',
          category: 'SECURITY',
          filePath: '.env.example',
          // Raw sensitive value that must NOT leak
          ...({ value: 'super-secret-jwt-token-12345' } as any),
        },
        {
          key: 'AUTH_TOKEN_EXPIRATION',
          category: 'SYSTEM',
          filePath: 'config/auth.json',
        },
        {
          key: 'DATABASE_PORT',
          category: 'INFRASTRUCTURE',
          filePath: 'config/db.json',
        },
      ],
    };

    const candidates = source.mapFeature(authFeature, context);

    expect(candidates).toHaveLength(2);

    const secretKeyCand = candidates.find((c) => c.resourceId === 'AUTH_JWT_SECRET');
    expect(secretKeyCand).toBeDefined();
    expect(secretKeyCand?.resourceType).toBe('CONFIGURATION');
    expect(secretKeyCand?.proposedRole).toBe('CONFIGURATION');

    // Ensure raw secret value is not stored in candidate metadata or evidence
    const candidateJson = JSON.stringify(secretKeyCand);
    expect(candidateJson).not.toContain('super-secret-jwt-token-12345');

    const dbPortCand = candidates.find((c) => c.resourceId === 'DATABASE_PORT');
    expect(dbPortCand).toBeUndefined();
  });
});
