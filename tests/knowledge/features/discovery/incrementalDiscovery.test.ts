import { describe, it, expect } from 'vitest';
import { FeatureDiscoveryEngine } from '../../../../src/knowledge/features/discovery/core/FeatureDiscoveryEngine';
import { FeatureType } from '../../../../src/knowledge/features/models/FeatureType';
import type { FeatureCandidate } from '../../../../src/knowledge/features/discovery/models/FeatureCandidate';
import type { DiscoveryContext } from '../../../../src/knowledge/features/discovery/models/DiscoverySource';

describe('Feature Discovery: Incremental Discovery', () => {
  it('should re-evaluate only candidates touching changed resources, leaving unaffected features untouched', async () => {
    const engine = new FeatureDiscoveryEngine();

    const authCandidate: FeatureCandidate = {
      candidateId: 'cand_auth',
      proposedName: 'Authentication',
      proposedDescription: 'User authentication',
      type: FeatureType.USER_FACING,
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      evidence: [],
      score: 0.85,
      confidence: { level: 'HIGH', score: 0.85, reasons: [] },
      sources: ['SYMBOL'],
      references: [
        {
          referenceId: 'ref_auth_1',
          resourceType: 'FILE',
          resourceId: 'src/auth/PasswordResetService.ts',
          role: 'IMPLEMENTATION',
          confidence: 0.9,
        },
      ],
      conflicts: [],
      status: 'VALIDATED',
      createdAt: 1000,
      updatedAt: 1000,
    };

    const paymentCandidate: FeatureCandidate = {
      candidateId: 'cand_payment',
      proposedName: 'Payment Processing',
      proposedDescription: 'Stripe payments',
      type: FeatureType.USER_FACING,
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      evidence: [],
      score: 0.9,
      confidence: { level: 'VERY_HIGH', score: 0.9, reasons: [] },
      sources: ['SYMBOL'],
      references: [
        {
          referenceId: 'ref_pay_1',
          resourceType: 'FILE',
          resourceId: 'src/payments/StripeService.ts',
          role: 'IMPLEMENTATION',
          confidence: 0.95,
        },
      ],
      conflicts: [],
      status: 'VALIDATED',
      createdAt: 1000,
      updatedAt: 1000,
    };

    engine.registerCandidate(authCandidate);
    engine.registerCandidate(paymentCandidate);

    const context: DiscoveryContext = {
      workspaceId: 'ws-1',
      repositoryId: 'repo-1',
      symbols: [
        {
          id: 'sym_pwd_reset',
          name: 'PasswordResetService',
          kind: 'ClassDeclaration',
          filePath: 'src/auth/PasswordResetService.ts',
          exported: true,
        },
      ],
    };

    // Incremental run: only PasswordResetService modified
    const incrementalResult = await engine.discoverIncremental(context, ['src/auth/PasswordResetService.ts']);

    expect(incrementalResult.reevaluatedCandidates.length).toBe(1);
    expect(incrementalResult.reevaluatedCandidates[0]?.candidateId).toBe('cand_auth');
    expect(incrementalResult.unaffectedCount).toBe(1);
  });
});
