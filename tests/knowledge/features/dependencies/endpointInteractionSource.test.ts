import { describe, it, expect } from 'vitest';
import { EndpointInteractionSource } from '../../../../src/knowledge/features/dependencies/sources/EndpointInteractionSource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { DependencyContext } from '../../../../src/knowledge/features/dependencies/interfaces/IFeatureRelationshipSource';

describe('Feature Dependency Graph: EndpointInteractionSource', () => {
  const source = new EndpointInteractionSource();
  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
  const featAuth = createDefaultFeature('feat_auth' as any, 'Authentication', scope);
  const featBilling = createDefaultFeature('feat_billing' as any, 'Billing', scope);
  const allFeatures = [featAuth, featBilling];

  it('should detect DEPENDS_ON relationship when endpoint is protected by security middleware', () => {
    const context: DependencyContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      featureMappings: [
        {
          mappingId: 'm_billing_ep',
          featureId: 'feat_billing',
          resourceId: 'POST /api/billing/charge',
          resourceType: 'ENDPOINT',
          role: 'API',
          confidence: { level: 'VERY_HIGH', score: 0.95, reasons: [] },
          score: 0.95,
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
      endpoints: [
        {
          id: 'ep_charge',
          method: 'POST',
          path: '/api/billing/charge',
          filePath: 'src/billing/BillingController.ts',
          middleware: ['AuthMiddleware'],
        } as any,
      ],
    };

    const candidates = source.discoverRelationships(featBilling, allFeatures, context);
    expect(candidates.length).toBe(1);
    expect(candidates[0].sourceFeatureId).toBe('feat_billing');
    expect(candidates[0].targetFeatureId).toBe('feat_auth');
    expect(candidates[0].proposedType).toBe('DEPENDS_ON');
    expect(candidates[0].score).toBeGreaterThanOrEqual(0.92);
  });

  it('should detect CONSUMES relationship when feature invokes another feature endpoint', () => {
    const context: DependencyContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      featureMappings: [
        {
          mappingId: 'm_auth_ep',
          featureId: 'feat_auth',
          resourceId: 'POST /api/auth/token',
          resourceType: 'ENDPOINT',
          role: 'API',
          confidence: { level: 'VERY_HIGH', score: 0.95, reasons: [] },
          score: 0.95,
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
          mappingId: 'm_billing_client',
          featureId: 'feat_billing',
          resourceId: 'src/billing/AuthApiClient.ts',
          resourceType: 'FILE',
          role: 'SUPPORT',
          confidence: { level: 'HIGH', score: 0.85, reasons: [] },
          score: 0.85,
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
      endpoints: [
        {
          id: 'ep_token',
          method: 'POST',
          path: '/api/auth/token',
          filePath: 'src/auth/AuthController.ts',
          callers: ['src/billing/AuthApiClient.ts'],
        } as any,
      ],
    };

    const candidates = source.discoverRelationships(featBilling, allFeatures, context);
    expect(candidates.length).toBe(1);
    expect(candidates[0].sourceFeatureId).toBe('feat_billing');
    expect(candidates[0].targetFeatureId).toBe('feat_auth');
    expect(candidates[0].proposedType).toBe('CONSUMES');
    expect(candidates[0].score).toBeGreaterThanOrEqual(0.9);
  });
});
