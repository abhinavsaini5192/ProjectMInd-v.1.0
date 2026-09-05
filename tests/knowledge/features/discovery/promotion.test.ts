import { describe, it, expect } from 'vitest';
import { FeatureDiscoveryEngine } from '../../../../src/knowledge/features/discovery/core/FeatureDiscoveryEngine';
import { FeatureRegistry } from '../../../../src/knowledge/features/core/FeatureRegistry';
import { FeatureOrigin } from '../../../../src/knowledge/features/models/FeatureOrigin';
import { FeatureType } from '../../../../src/knowledge/features/models/FeatureType';
import { FeatureStatus } from '../../../../src/knowledge/features/models/FeatureStatus';
import type { FeatureCandidate } from '../../../../src/knowledge/features/discovery/models/FeatureCandidate';
import { CandidateValidationError } from '../../../../src/knowledge/features/discovery/errors/CandidateValidationError';

describe('Feature Discovery: Promotion & Manual Feature Protection', () => {
  it('should promote a validated candidate into FeatureRegistry with DISCOVERED origin', async () => {
    const registry = new FeatureRegistry();
    const engine = new FeatureDiscoveryEngine(registry);

    const candidate: FeatureCandidate = {
      candidateId: 'cand_auth_1',
      proposedName: 'Authentication',
      proposedDescription: 'User authentication and tokens',
      type: FeatureType.USER_FACING,
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      evidence: [
        {
          evidenceId: 'e1',
          sourceType: 'ENDPOINT',
          sourceId: 'POST /api/auth/login',
          evidenceType: 'API_ROUTE',
          description: 'Login route',
          targetCapability: 'Authentication',
          strength: 'VERY_STRONG',
          confidence: 0.95,
          timestamp: 1000,
        },
      ],
      score: 0.85,
      confidence: { level: 'HIGH', score: 0.85, reasons: ['Strong evidence'] },
      sources: ['ENDPOINT'],
      references: [
        {
          referenceId: 'ref_1',
          resourceType: 'ENDPOINT',
          resourceId: 'POST /api/auth/login',
          role: 'ENTRY_POINT',
          confidence: 0.95,
        },
      ],
      conflicts: [],
      status: 'VALIDATED',
      createdAt: 1000,
      updatedAt: 1000,
    };

    engine.registerCandidate(candidate);

    const feature = await engine.promoteCandidate('cand_auth_1');

    expect(feature).toBeDefined();
    expect(feature.name).toBe('Authentication');
    expect(feature.origin).toBe(FeatureOrigin.DISCOVERED);
    expect(candidate.status).toBe('PROMOTED');

    // Verify registry contains it
    const stored = registry.getByName('Authentication');
    expect(stored).toBeDefined();
    expect(stored.id).toBe(feature.id);
  });

  it('should strictly protect MANUAL features: never overwrite origin or replace the manual feature', async () => {
    const registry = new FeatureRegistry();

    // 1. Manually registered feature by user
    const manualFeature = {
      id: 'feat_manual_auth_001',
      name: 'Authentication',
      description: 'Manually defined authentication architecture',
      type: FeatureType.USER_FACING,
      status: FeatureStatus.ACTIVE,
      origin: FeatureOrigin.MANUAL,
      confidence: { score: 1.0, level: 'VERY_HIGH', rationale: 'Handcrafted' },
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      version: { major: 1, minor: 0, patch: 0 },
      references: [
        {
          referenceId: 'ref_manual_1',
          resourceType: 'FILE',
          resourceId: 'src/auth/manual_auth.ts',
          role: 'IMPLEMENTATION',
          confidence: 1.0,
        },
      ],
      createdAt: 1000,
      updatedAt: 1000,
    };
    registry.registerSync(manualFeature);

    const engine = new FeatureDiscoveryEngine(registry);

    // 2. Newly discovered candidate with the same capability name
    const candidate: FeatureCandidate = {
      candidateId: 'cand_auto_auth',
      proposedName: 'Authentication',
      proposedDescription: 'Auto-detected authentication capability',
      type: FeatureType.USER_FACING,
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      evidence: [
        {
          evidenceId: 'e2',
          sourceType: 'ENDPOINT',
          sourceId: 'POST /api/v1/login',
          evidenceType: 'API_ROUTE',
          description: 'Login endpoint',
          targetCapability: 'Authentication',
          strength: 'VERY_STRONG',
          confidence: 0.9,
          timestamp: 1000,
        },
      ],
      score: 0.8,
      confidence: { level: 'HIGH', score: 0.8, reasons: [] },
      sources: ['ENDPOINT'],
      references: [
        {
          referenceId: 'ref_discovered_1',
          resourceType: 'ENDPOINT',
          resourceId: 'POST /api/v1/login',
          role: 'ENTRY_POINT',
          confidence: 0.9,
        },
      ],
      conflicts: [],
      status: 'VALIDATED',
      createdAt: 1000,
      updatedAt: 1000,
    };

    engine.registerCandidate(candidate);

    const promoted = await engine.promoteCandidate('cand_auto_auth');

    // Verification: Must remain the original manual feature ID and MANUAL origin
    expect(promoted.id).toBe('feat_manual_auth_001');
    expect(promoted.origin).toBe(FeatureOrigin.MANUAL);
    expect(candidate.status).toBe('PROMOTED');

    // Discovered references must be merged into the existing manual feature
    const hasDiscoveredRef = promoted.references.some((r: any) => r.resourceId === 'POST /api/v1/login');
    const hasOriginalRef = promoted.references.some((r: any) => r.resourceId === 'src/auth/manual_auth.ts');
    expect(hasDiscoveredRef).toBe(true);
    expect(hasOriginalRef).toBe(true);

    // Registry must still have MANUAL feature
    const fromRegistry = registry.getByName('Authentication');
    expect(fromRegistry.origin).toBe(FeatureOrigin.MANUAL);
    expect(fromRegistry.id).toBe('feat_manual_auth_001');
  });

  it('should reject promotion of a candidate in REJECTED status', async () => {
    const registry = new FeatureRegistry();
    const engine = new FeatureDiscoveryEngine(registry);

    const candidate: FeatureCandidate = {
      candidateId: 'cand_bad',
      proposedName: 'BadCandidate',
      proposedDescription: 'Invalid candidate',
      type: FeatureType.USER_FACING,
      scope: { workspaceId: 'ws-1', repositoryId: 'repo-1' },
      evidence: [],
      score: 0.1,
      confidence: { level: 'VERY_LOW', score: 0.1, reasons: [] },
      sources: [],
      references: [],
      conflicts: [],
      status: 'REJECTED',
      createdAt: 1000,
      updatedAt: 1000,
    };

    engine.registerCandidate(candidate);

    await expect(engine.promoteCandidate('cand_bad')).rejects.toThrow(CandidateValidationError);
  });
});
