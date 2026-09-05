import { describe, it, expect } from 'vitest';
import { EndpointMappingSource } from '../../../../src/knowledge/features/mapping/sources/EndpointMappingSource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { MappingContext } from '../../../../src/knowledge/features/mapping/interfaces/IFeatureMappingSource';

describe('Feature-to-Code Mapping: EndpointMappingSource', () => {
  const source = new EndpointMappingSource();

  it('should map API routes to feature with VERY_HIGH confidence and ENTRY_POINT role', () => {
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
          handlerSymbolId: 'sym_login_handler',
        },
        {
          method: 'POST',
          path: '/api/v1/auth/logout',
          filePath: 'src/auth/AuthController.ts',
        },
        {
          method: 'GET',
          path: '/api/v1/billing/invoices',
          filePath: 'src/billing/BillingController.ts',
        },
      ],
    };

    const candidates = source.mapFeature(authFeature, context);

    expect(candidates).toHaveLength(2);

    const loginEp = candidates.find((c) => c.resourceId === 'POST /api/v1/auth/login');
    expect(loginEp).toBeDefined();
    expect(loginEp?.resourceType).toBe('ENDPOINT');
    expect(loginEp?.proposedRole).toBe('ENTRY_POINT');
    expect(loginEp?.confidence.level).toBe('VERY_HIGH');
    expect(loginEp?.score).toBeGreaterThanOrEqual(0.92);
    expect(loginEp?.evidence[0]?.evidenceType).toBe('API_ENTRYPOINT');
    expect(loginEp?.evidence[0]?.metadata?.method).toBe('POST');
    expect(loginEp?.evidence[0]?.metadata?.path).toBe('/api/v1/auth/login');

    const billingEp = candidates.find((c) => c.resourceId === 'GET /api/v1/billing/invoices');
    expect(billingEp).toBeUndefined();
  });

  it('should handle missing endpoints in context gracefully', () => {
    const authFeature = createDefaultFeature('feat_auth', 'Authentication', {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
    });
    const candidates = source.mapFeature(authFeature, { workspaceId: 'ws-1', repositoryId: 'repo-1' });
    expect(candidates).toEqual([]);
  });
});
