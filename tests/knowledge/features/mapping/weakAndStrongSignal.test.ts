import { describe, it, expect } from 'vitest';
import { FeatureMappingCoordinator } from '../../../../src/knowledge/features/mapping/core/FeatureMappingCoordinator';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { MappingContext } from '../../../../src/knowledge/features/mapping/interfaces/IFeatureMappingSource';

describe('Feature-to-Code Mapping: Weak vs Strong Signals', () => {
  const coordinator = new FeatureMappingCoordinator();

  it('should promote strong signals to high confidence mappings and filter out weak/generic utilities', async () => {
    const authFeature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });

    const context: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/auth/login',
          filePath: 'src/auth/AuthController.ts',
        },
      ],
      symbols: [
        {
          id: 'sym_auth_svc',
          name: 'AuthService',
          kind: 'ClassDeclaration',
          filePath: 'src/auth/AuthService.ts',
        },
        // Weak / generic utility signal with "auth" in name or path
        {
          id: 'sym_string_util',
          name: 'formatAuthHeader',
          kind: 'FunctionDeclaration',
          filePath: 'src/utils/stringUtils.ts',
        },
      ],
      modules: [
        {
          id: 'mod_auth',
          name: 'auth',
          path: 'src/auth',
          exports: ['AuthService', 'AuthController'],
        },
      ],
    };

    const result = await coordinator.coordinateFeatureMapping(authFeature, context);

    const resourceIds = result.mappings.map((m) => m.resourceId);

    // Strong signals must be mapped
    expect(resourceIds).toContain('POST /api/v1/auth/login');
    expect(resourceIds).toContain('sym_auth_svc');

    // Weak / generic utility file should be filtered out
    expect(resourceIds).not.toContain('sym_string_util');
    expect(resourceIds).not.toContain('src/utils/stringUtils.ts');

    // Verify strong confidence
    const endpointMapping = result.mappings.find((m) => m.resourceId === 'POST /api/v1/auth/login');
    expect(endpointMapping?.confidence.level).toBe('VERY_HIGH');
    expect(endpointMapping?.score).toBeGreaterThanOrEqual(0.92);
  });
});
