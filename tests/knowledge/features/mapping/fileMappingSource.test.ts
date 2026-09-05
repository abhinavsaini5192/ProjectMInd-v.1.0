import { describe, it, expect } from 'vitest';
import { FileMappingSource } from '../../../../src/knowledge/features/mapping/sources/FileMappingSource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { MappingContext } from '../../../../src/knowledge/features/mapping/interfaces/IFeatureMappingSource';

describe('Feature-to-Code Mapping: FileMappingSource', () => {
  const source = new FileMappingSource();

  it('should map files containing feature symbols and ignore generic utility files', () => {
    const authFeature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });

    const context: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      symbols: [
        {
          id: 'sym_auth_svc',
          name: 'AuthService',
          kind: 'ClassDeclaration',
          filePath: 'src/auth/AuthService.ts',
          exported: true,
        },
        {
          id: 'sym_format_date',
          name: 'formatDate',
          kind: 'FunctionDeclaration',
          filePath: 'src/utils/date.ts',
          exported: true,
        },
      ],
      endpoints: [
        {
          method: 'POST',
          path: '/api/v1/auth/login',
          filePath: 'src/auth/AuthController.ts',
        },
      ],
    };

    const candidates = source.mapFeature(authFeature, context);

    const resourceIds = candidates.map((c) => c.resourceId);
    expect(resourceIds).toContain('src/auth/AuthService.ts');
    expect(resourceIds).toContain('src/auth/AuthController.ts');
    expect(resourceIds).not.toContain('src/utils/date.ts');

    const authServiceCand = candidates.find((c) => c.resourceId === 'src/auth/AuthService.ts');
    expect(authServiceCand?.proposedRole).toBe('IMPLEMENTATION');
    expect(authServiceCand?.confidence.level).toMatch(/HIGH|VERY_HIGH/);

    const authCtrlCand = candidates.find((c) => c.resourceId === 'src/auth/AuthController.ts');
    expect(authCtrlCand?.proposedRole).toBe('ENTRY_POINT');
  });
});
