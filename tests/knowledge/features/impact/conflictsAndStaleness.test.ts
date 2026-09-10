import { describe, it, expect } from 'vitest';
import { ImpactTestHelper } from './ImpactTestHelper.js';
import { ImpactValidator } from '../../../../src/knowledge/features/impact/core/ImpactValidator.js';
import { ChangeSourceHelper } from '../../../../src/knowledge/features/impact/sources/ChangeSource.js';
import { FeatureImpactRepository } from '../../../../src/knowledge/features/impact/repository/FeatureImpactRepository.js';

describe('Phase 6.7 - Conflicts & Staleness', () => {
  it('ImpactValidator should detect conflict when dependency graph asserts relation but behavior flow bypasses it (Section 32)', () => {
    const validator = new ImpactValidator();

    // Behavior with bypass flow
    const bypassFlow = ImpactTestHelper.createFlow('flow_checkout', 'feat_checkout', 'Checkout Bypass Flow', [], {
      bypassesDependency: true,
    });
    const behavior = ImpactTestHelper.createBehavior('feat_checkout', [bypassFlow]);

    const context = ImpactTestHelper.createContext({
      changes: [],
      behaviors: [behavior],
    });

    const depEv = ChangeSourceHelper.createEvidence({
      source: 'DEPENDENCY',
      sourceId: 'dep_1',
      evidenceType: 'FEATURE_DEPENDENCY',
      description: 'Checkout depends on Authentication',
      confidence: 0.85,
    });

    const candidate = ChangeSourceHelper.createCandidate({
      sourceChangeId: 'chg_1',
      targetFeatureId: 'feat_checkout',
      impactType: 'DEPENDENCY',
      scope: 'FEATURE',
      confidence: 'HIGH',
      direct: false,
      distance: 1,
      evidence: [depEv],
      contributingChanges: [],
    });

    const conflicts = validator.detectConflicts([candidate], context);

    expect(conflicts.length).toBe(1);
    expect(conflicts[0]!.conflictType).toBe('DEPENDENCY_VS_BEHAVIOR_BYPASS');
    expect(conflicts[0]!.resolutionStatus).toBe('UNRESOLVED');
  });

  it('FeatureImpactRepository should track staleness and deactivation reasons', async () => {
    const repo = new FeatureImpactRepository();

    const impact = {
      impactId: 'imp_1',
      targetFeatureId: 'feat_checkout',
      impactType: 'INDIRECT' as any,
      impactScope: 'FEATURE' as any,
      direction: 'DOWNSTREAM' as any,
      severity: 'MEDIUM' as any,
      score: 70,
      confidence: 'HIGH' as any,
      direct: false,
      distance: 1,
      evidence: [],
      impactPathIds: [],
      contributingChanges: [],
      criticality: 'MEDIUM',
      knowledgeVersion: '1.0.0',
      impactVersion: 1,
      active: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await repo.saveResult({
      runId: 'run_1',
      repositoryId: 'repo_1',
      analysisMode: 'FULL',
      sourceChanges: [],
      directImpacts: [],
      indirectImpacts: [impact],
      resourceImpacts: [],
      featureImpacts: [impact],
      impactPaths: [],
      conflicts: [],
      staleImpacts: [],
      statistics: {} as any,
      version: {} as any,
      startedAt: Date.now(),
      completedAt: Date.now(),
    });

    // Active initially
    let impacts = await repo.getFeatureImpacts('feat_checkout', true);
    expect(impacts).toHaveLength(1);

    // Invalidate by feature
    await repo.invalidateByFeature('feat_checkout', 'DEPENDENCY_REMOVED');

    impacts = await repo.getFeatureImpacts('feat_checkout', true);
    expect(impacts).toHaveLength(0); // activeOnly: true returns empty

    const all = await repo.getFeatureImpacts('feat_checkout', false);
    expect(all).toHaveLength(1);
    expect(all[0]!.active).toBe(false);
    expect(all[0]!.metadata?.deactivationReason).toBe('DEPENDENCY_REMOVED');
  });
});
