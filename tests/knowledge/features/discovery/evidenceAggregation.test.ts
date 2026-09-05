import { describe, it, expect } from 'vitest';
import { FeatureEvidenceAggregator } from '../../../../src/knowledge/features/discovery/core/FeatureEvidenceAggregator';
import type { FeatureCandidate } from '../../../../src/knowledge/features/discovery/models/FeatureCandidate';
import type { DiscoveryEvidence } from '../../../../src/knowledge/features/discovery/models/DiscoveryEvidence';
import { FeatureType } from '../../../../src/knowledge/features/models/FeatureType';

describe('Feature Discovery: Evidence Aggregation', () => {
  it('should merge duplicate evidence items keeping highest confidence', () => {
    const aggregator = new FeatureEvidenceAggregator();

    const initialEvidence: DiscoveryEvidence = {
      evidenceId: 'ev_1',
      sourceType: 'ENDPOINT',
      sourceId: 'POST /login',
      evidenceType: 'API_ROUTE',
      description: 'Login endpoint',
      targetCapability: 'Authentication',
      strength: 'STRONG',
      confidence: 0.8,
      timestamp: 1000,
    };

    const duplicateEvidenceHigherConf: DiscoveryEvidence = {
      evidenceId: 'ev_2',
      sourceType: 'ENDPOINT',
      sourceId: 'POST /login',
      evidenceType: 'API_ROUTE',
      description: 'Login endpoint updated',
      targetCapability: 'Authentication',
      strength: 'VERY_STRONG',
      confidence: 0.95,
      timestamp: 2000,
    };

    const candidate: FeatureCandidate = {
      candidateId: 'fc_1',
      proposedName: 'Authentication',
      proposedDescription: 'Auth feature',
      type: FeatureType.USER_FACING,
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      evidence: [initialEvidence],
      score: 0.8,
      confidence: { level: 'HIGH', score: 0.8, reasons: [] },
      sources: ['ENDPOINT'],
      references: [],
      conflicts: [],
      status: 'DETECTED',
      createdAt: 1000,
      updatedAt: 1000,
    };

    const aggregated = aggregator.aggregate(candidate, [duplicateEvidenceHigherConf]);
    expect(aggregated.evidence.length).toBe(1);
    expect(aggregated.evidence[0]?.confidence).toBe(0.95);
  });
});
