import { describe, it, expect } from 'vitest';
import { DependencyMappingSource } from '../../../../src/knowledge/features/mapping/sources/DependencyMappingSource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { MappingContext } from '../../../../src/knowledge/features/mapping/interfaces/IFeatureMappingSource';

describe('Feature-to-Code Mapping: DependencyMappingSource', () => {
  const source = new DependencyMappingSource();

  it('should map specific package dependencies while filtering generic libraries', () => {
    const authFeature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });

    const context: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      dependencies: [
        {
          sourceId: 'src/auth/AuthService.ts',
          targetId: 'jsonwebtoken',
          type: 'EXTERNAL_PACKAGE',
        },
        {
          sourceId: 'src/auth/AuthService.ts',
          targetId: 'bcrypt',
          type: 'EXTERNAL_PACKAGE',
        },
        // Generic libraries that MUST be ignored
        {
          sourceId: 'src/auth/AuthService.ts',
          targetId: 'lodash',
          type: 'EXTERNAL_PACKAGE',
        },
        {
          sourceId: 'src/auth/AuthService.ts',
          targetId: 'date-fns',
          type: 'EXTERNAL_PACKAGE',
        },
        {
          sourceId: 'src/auth/AuthService.ts',
          targetId: 'winston',
          type: 'EXTERNAL_PACKAGE',
        },
      ],
    };

    const candidates = source.mapFeature(authFeature, context);

    const resourceIds = candidates.map((c) => c.resourceId);
    expect(resourceIds).toContain('jsonwebtoken');
    expect(resourceIds).not.toContain('lodash');
    expect(resourceIds).not.toContain('date-fns');
    expect(resourceIds).not.toContain('winston');

    const jwtCand = candidates.find((c) => c.resourceId === 'jsonwebtoken');
    expect(jwtCand?.resourceType).toBe('DEPENDENCY');
    expect(jwtCand?.proposedRole).toBe('DEPENDENCY');
  });

  it('should assign INTEGRATION role for payment gateway dependencies', () => {
    const billingFeature = createDefaultFeature('feat_billing', 'Stripe Payment Processing', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });

    const context: MappingContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      dependencies: [
        {
          sourceId: 'src/billing/PaymentService.ts',
          targetId: 'stripe',
          type: 'EXTERNAL_PACKAGE',
        },
      ],
    };

    const candidates = source.mapFeature(billingFeature, context);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]!.resourceId).toBe('stripe');
    expect(candidates[0]!.proposedRole).toBe('INTEGRATION');
  });
});
