import { describe, it, expect } from 'vitest';
import { ModuleMappingSource } from '../../../../src/knowledge/features/mapping/sources/ModuleMappingSource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { MappingContext } from '../../../../src/knowledge/features/mapping/interfaces/IFeatureMappingSource';

describe('Feature-to-Code Mapping: ModuleMappingSource', () => {
  const source = new ModuleMappingSource();

  it('should map module container to feature based on name and export alignment', () => {
    const authFeature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });

    const context: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      modules: [
        {
          id: 'mod_auth',
          name: 'auth',
          path: 'src/auth',
          exports: ['AuthService', 'AuthController', 'loginUser', 'verifyToken'],
        },
        {
          id: 'mod_billing',
          name: 'billing',
          path: 'src/billing',
          exports: ['StripeService', 'InvoiceGenerator'],
        },
      ],
    };

    const candidates = source.mapFeature(authFeature, context);

    expect(candidates).toHaveLength(1);
    const authMod = candidates[0]!;
    expect(authMod.resourceId).toBe('mod_auth');
    expect(authMod.resourceType).toBe('MODULE');
    expect(authMod.proposedRole).toBe('ORCHESTRATION');
    expect(authMod.score).toBeGreaterThan(0.7);
    expect(authMod.evidence[0]!.evidenceType).toBe('MODULE_COHERENCE');
  });

  it('should demonstrate that modules != features: a single module can map to multiple features', () => {
    const userFeature = createDefaultFeature('feat_user', 'User Management', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });
    const authFeature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });

    const sharedModuleContext: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      modules: [
        {
          id: 'mod_iam',
          name: 'identity_and_access',
          path: 'src/iam',
          exports: ['AuthService', 'UserProfileManager', 'RoleChecker', 'UserRegistrationService'],
        },
      ],
    };

    const authCandidates = source.mapFeature(authFeature, sharedModuleContext);
    const userCandidates = source.mapFeature(userFeature, sharedModuleContext);

    expect(authCandidates).toHaveLength(1);
    expect(authCandidates[0]!.resourceId).toBe('mod_iam');

    expect(userCandidates).toHaveLength(1);
    expect(userCandidates[0]!.resourceId).toBe('mod_iam');
  });
});
