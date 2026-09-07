import { describe, it, expect } from 'vitest';
import { ConfigurationDependencySource } from '../../../../src/knowledge/features/dependencies/sources/ConfigurationDependencySource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { DependencyContext } from '../../../../src/knowledge/features/dependencies/interfaces/IFeatureRelationshipSource';

describe('Feature Dependency Graph: ConfigurationDependencySource', () => {
  const source = new ConfigurationDependencySource();
  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
  const featBilling = createDefaultFeature('feat_billing' as any, 'Billing', scope);
  const featAuth = createDefaultFeature('feat_auth' as any, 'Authentication', scope);
  const allFeatures = [featBilling, featAuth];

  it('should detect INTEGRATES_WITH and redact sensitive configuration values', () => {
    const context: DependencyContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      featureMappings: [
        {
          mappingId: 'm1',
          featureId: 'feat_billing',
          resourceId: 'config/billing.json',
          resourceType: 'CONFIGURATION',
          role: 'CONFIGURATION',
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
      configurations: [
        {
          filePath: 'config/billing.json',
          format: 'JSON',
          keys: [
            {
              key: 'auth_jwt_secret',
              value: 'super_secret_jwt_token_12345',
            },
          ],
        } as any,
      ],
    };

    const candidates = source.discoverRelationships(featBilling, allFeatures, context);
    expect(candidates.length).toBe(1);
    expect(candidates[0].proposedType).toBe('INTEGRATES_WITH');
    expect(candidates[0].targetFeatureId).toBe('feat_auth');

    // Verify secret redaction
    const ev = candidates[0].evidence[0];
    expect(ev.description).toContain('[REDACTED]');
    expect(ev.description).not.toContain('super_secret_jwt_token_12345');
    expect(ev.metadata.rawVal).toBeUndefined();
  });
});
