import { describe, it, expect } from 'vitest';
import { SymbolMappingSource } from '../../../../src/knowledge/features/mapping/sources/SymbolMappingSource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { MappingContext } from '../../../../src/knowledge/features/mapping/interfaces/IFeatureMappingSource';

describe('Feature-to-Code Mapping: SymbolMappingSource', () => {
  const source = new SymbolMappingSource();

  it('should infer appropriate roles for controller, service, repository, and config symbols', () => {
    const feature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });

    const context: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      symbols: [
        {
          id: 'sym_auth_ctrl',
          name: 'AuthController',
          kind: 'ClassDeclaration',
          filePath: 'src/auth/AuthController.ts',
        },
        {
          id: 'sym_auth_svc',
          name: 'AuthService',
          kind: 'ClassDeclaration',
          filePath: 'src/auth/AuthService.ts',
        },
        {
          id: 'sym_auth_repo',
          name: 'AuthRepository',
          kind: 'ClassDeclaration',
          filePath: 'src/auth/AuthRepository.ts',
        },
        {
          id: 'sym_auth_cfg',
          name: 'AuthConfig',
          kind: 'InterfaceDeclaration',
          filePath: 'src/auth/AuthConfig.ts',
        },
        {
          id: 'sym_date_util',
          name: 'formatDate',
          kind: 'FunctionDeclaration',
          filePath: 'src/utils/date.ts',
        },
      ],
    };

    const candidates = source.mapFeature(feature, context);

    expect(candidates).toHaveLength(4);

    const ctrl = candidates.find((c) => c.resourceId === 'sym_auth_ctrl');
    expect(ctrl?.proposedRole).toBe('API');
    expect(ctrl?.resourceType).toBe('SYMBOL');
    expect(ctrl?.confidence.level).toMatch(/HIGH|VERY_HIGH/);

    const svc = candidates.find((c) => c.resourceId === 'sym_auth_svc');
    expect(svc?.proposedRole).toBe('IMPLEMENTATION');

    const repo = candidates.find((c) => c.resourceId === 'sym_auth_repo');
    expect(repo?.proposedRole).toBe('STORAGE');

    const cfg = candidates.find((c) => c.resourceId === 'sym_auth_cfg');
    expect(cfg?.proposedRole).toBe('CONFIGURATION');

    // Generic date utility must NOT be mapped
    const util = candidates.find((c) => c.resourceId === 'sym_date_util');
    expect(util).toBeUndefined();
  });

  it('should return empty candidates if no symbols in context', () => {
    const feature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });
    const candidates = source.mapFeature(feature, { workspaceId: 'ws-1', repositoryId: 'repo-1' });
    expect(candidates).toEqual([]);
  });
});
