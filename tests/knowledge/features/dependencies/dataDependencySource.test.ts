import { describe, it, expect } from 'vitest';
import { DataDependencySource } from '../../../../src/knowledge/features/dependencies/sources/DataDependencySource';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { DependencyContext } from '../../../../src/knowledge/features/dependencies/interfaces/IFeatureRelationshipSource';

describe('Feature Dependency Graph: DataDependencySource', () => {
  const source = new DataDependencySource();
  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
  const featBilling = createDefaultFeature('feat_billing' as any, 'Billing', scope);
  const featUser = createDefaultFeature('feat_user' as any, 'User Management', scope);
  const allFeatures = [featBilling, featUser];

  it('should detect USES relationship when entity has foreign key referencing another feature entity', () => {
    const context: DependencyContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      featureMappings: [
        {
          mappingId: 'm_invoice',
          featureId: 'feat_billing',
          resourceId: 'InvoiceEntity',
          resourceType: 'DATABASE_ENTITY',
          role: 'STORAGE',
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
          mappingId: 'm_user',
          featureId: 'feat_user',
          resourceId: 'UserEntity',
          resourceType: 'DATABASE_ENTITY',
          role: 'STORAGE',
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
      databaseEntities: [
        {
          entityName: 'InvoiceEntity',
          tableName: 'invoices',
          columns: ['id', 'user_id', 'amount'],
          foreignKeys: [
            {
              column: 'user_id',
              referencedEntity: 'UserEntity',
              referencedColumn: 'id',
            },
          ],
        } as any,
      ],
    };

    const candidates = source.discoverRelationships(featBilling, allFeatures, context);
    expect(candidates.length).toBe(1);
    expect(candidates[0].sourceFeatureId).toBe('feat_billing');
    expect(candidates[0].targetFeatureId).toBe('feat_user');
    expect(candidates[0].proposedType).toBe('USES');
    expect(candidates[0].direction).toBe('DIRECTED');
  });

  it('should detect SHARES_DATA when database entity is shared across multiple features', () => {
    const context: DependencyContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      featureMappings: [
        {
          mappingId: 'm1',
          featureId: 'feat_billing',
          resourceId: 'AccountEntity',
          resourceType: 'DATABASE_ENTITY',
          role: 'STORAGE',
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
        {
          mappingId: 'm2',
          featureId: 'feat_user',
          resourceId: 'AccountEntity',
          resourceType: 'DATABASE_ENTITY',
          role: 'STORAGE',
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
      databaseEntities: [
        {
          entityName: 'AccountEntity',
          tableName: 'accounts',
          columns: ['id', 'balance'],
        } as any,
      ],
    };

    const candidates = source.discoverRelationships(featBilling, allFeatures, context);
    expect(candidates.length).toBe(1);
    expect(candidates[0].proposedType).toBe('SHARES_DATA');
    expect(candidates[0].direction).toBe('BIDIRECTIONAL');
  });
});
