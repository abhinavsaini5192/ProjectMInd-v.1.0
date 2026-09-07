import { describe, it, expect } from 'vitest';
import { FeatureDependencyExplainer } from '../../../../src/knowledge/features/dependencies/core/FeatureDependencyExplainer';
import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature';
import type { FeatureRelationship } from '../../../../src/knowledge/features/dependencies/models/FeatureRelationship';

describe('Feature Dependency Graph: Dependency Explainer', () => {
  const explainer = new FeatureDependencyExplainer();
  const scope = { workspaceId: 'ws-1', repositoryId: 'repo-1' };
  const featAuth = createDefaultFeature('feat_auth' as any, 'Authentication', scope);
  const featBilling = createDefaultFeature('feat_billing' as any, 'Billing', scope);

  it('should generate structured explanation and readable markdown narrative', () => {
    const rel: FeatureRelationship = {
      relationshipId: 'rel_123',
      sourceFeatureId: 'feat_billing' as any,
      targetFeatureId: 'feat_auth' as any,
      relationshipType: 'DEPENDS_ON',
      direction: 'DIRECTED',
      confidence: {
        level: 'VERY_HIGH',
        score: 0.95,
        reasons: ['Protected by security middleware', 'Imports AuthService'],
      },
      score: 0.95,
      evidence: [
        {
          evidenceId: 'ev_1',
          sourceType: 'ENDPOINT',
          sourceId: 'POST /charge',
          evidenceType: 'SECURITY_MIDDLEWARE',
          description: 'Endpoint protected by AuthMiddleware',
          strength: 0.95,
          confidence: 0.95,
          metadata: { location: 'src/billing/BillingController.ts' },
          timestamp: 0,
        },
        {
          evidenceId: 'ev_2',
          sourceType: 'CODE_DEPENDENCY',
          sourceId: 'src/billing/BillingService.ts',
          evidenceType: 'IMPORT',
          description: 'Imports AuthService for user tokens',
          strength: 0.9,
          confidence: 0.9,
          metadata: { location: 'src/billing/BillingService.ts' },
          timestamp: 0,
        },
      ],
      source: 'DISCOVERED',
      scope,
      createdAt: 0,
      updatedAt: 0,
      knowledgeVersion: '2.0.0',
      relationshipVersion: 1,
      active: true,
    };

    const explanation = explainer.explainRelationship(rel, featBilling, featAuth);

    expect(explanation.relationshipId).toBe('rel_123');
    expect(explanation.source.name).toBe('Billing');
    expect(explanation.target.name).toBe('Authentication');
    expect(explanation.summary).toContain('Billing depends on Authentication');
    expect(explanation.evidenceBySource['ENDPOINT'].count).toBe(1);
    expect(explanation.evidenceBySource['CODE_DEPENDENCY'].count).toBe(1);
    expect(explanation.narrative).toContain('### Relationship Explanation: Billing → Authentication');
    expect(explanation.narrative).toContain('AuthMiddleware');
  });

  it('should flag architectural risk factors when appropriate', () => {
    const dataRel: FeatureRelationship = {
      relationshipId: 'rel_data',
      sourceFeatureId: 'feat_billing' as any,
      targetFeatureId: 'feat_auth' as any,
      relationshipType: 'SHARES_DATA',
      direction: 'BIDIRECTIONAL',
      confidence: { level: 'LOW', score: 0.35, reasons: [] },
      score: 0.35,
      evidence: [],
      source: 'DISCOVERED',
      scope,
      createdAt: 0,
      updatedAt: 0,
      knowledgeVersion: '2.0.0',
      relationshipVersion: 1,
      active: true,
    };

    const explanation = explainer.explainRelationship(dataRel, featBilling, featAuth);
    expect(explanation.riskFactors.some((r) => r.includes('Shared data store'))).toBe(true);
    expect(explanation.riskFactors.some((r) => r.includes('Low confidence score'))).toBe(true);
  });
});
