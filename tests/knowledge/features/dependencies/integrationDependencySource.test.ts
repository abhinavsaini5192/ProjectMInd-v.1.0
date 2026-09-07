import { describe, it, expect } from 'vitest';
import { IntegrationDependencySource } from '../../../../src/knowledge/features/dependencies/sources/IntegrationDependencySource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { DependencyContext } from '../../../../src/knowledge/features/dependencies/interfaces/IFeatureRelationshipSource';

describe('Feature Dependency Graph: IntegrationDependencySource', () => {
  const source = new IntegrationDependencySource();
  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
  const featBilling = createDefaultFeature('feat_billing' as any, 'Billing', scope);
  const featNotif = createDefaultFeature('feat_notif' as any, 'Notifications', scope);
  const allFeatures = [featBilling, featNotif];

  it('should detect TRIGGERS relationship when publisher emits event consumed by subscriber', () => {
    const context: DependencyContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      featureMappings: [
        {
          mappingId: 'm1',
          featureId: 'feat_billing',
          resourceId: 'src/billing/InvoiceService.ts',
          resourceType: 'FILE',
          role: 'IMPLEMENTATION',
          confidence: { level: 'HIGH', score: 0.9, reasons: [] },
          score: 0.9,
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
          mappingId: 'm2',
          featureId: 'feat_notif',
          resourceId: 'src/notifications/EmailConsumer.ts',
          resourceType: 'FILE',
          role: 'IMPLEMENTATION',
          confidence: { level: 'HIGH', score: 0.9, reasons: [] },
          score: 0.9,
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
      integrationEvents: [
        {
          eventId: 'ev_invoice_created',
          eventName: 'invoice.created',
          publisherResourceId: 'src/billing/InvoiceService.ts',
          consumerResourceId: 'src/notifications/EmailConsumer.ts',
        },
      ],
    };

    const candidates = source.discoverRelationships(featBilling, allFeatures, context);
    expect(candidates.length).toBe(1);
    expect(candidates[0].sourceFeatureId).toBe('feat_billing');
    expect(candidates[0].targetFeatureId).toBe('feat_notif');
    expect(candidates[0].proposedType).toBe('TRIGGERS');
    expect(candidates[0].score).toBeGreaterThanOrEqual(0.85);
  });
});
