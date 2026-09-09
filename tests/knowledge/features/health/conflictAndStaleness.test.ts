import { describe, it, expect } from 'vitest';
import { HealthTestHelper } from './HealthTestHelper.js';
import { FeatureHealthAnalyzer } from '../../../../src/knowledge/features/health/core/FeatureHealthAnalyzer.js';
import { FeatureHealthRepository } from '../../../../src/knowledge/features/health/repository/FeatureHealthRepository.js';
import { HealthSignalHelper } from '../../../../src/knowledge/features/health/signals/HealthSignalHelper.js';

describe('Phase 6.6 Conflicts & Staleness Handling', () => {
  it('detects conflicting metrics when test signals dispute each other', () => {
    const analyzer = new FeatureHealthAnalyzer();

    const sig1 = HealthSignalHelper.createSignal({
      featureId: 'feat_conf',
      signalType: 'MISSING_TESTS',
      severity: 'HIGH',
      value: 0,
      normalizedValue: 100,
      description: 'Tests missing',
      evidence: [],
      source: 'test',
      confidence: 0.9
    });

    const sig2 = HealthSignalHelper.createSignal({
      featureId: 'feat_conf',
      signalType: 'FLAKY_TEST_HISTORY',
      severity: 'MEDIUM',
      value: 'flake_detected',
      normalizedValue: 50,
      description: 'Tests exist and flake',
      evidence: [],
      source: 'test',
      confidence: 0.85
    });

    const conflicts = analyzer.detectConflicts([sig1, sig2], []);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].conflictType).toBe('INCONSISTENT_METRIC');
    expect(conflicts[0].resolutionStatus).toBe('UNRESOLVED');
  });

  it('marks features as stale in repository', async () => {
    const repo = new FeatureHealthRepository();
    const feature = HealthTestHelper.createFeature('feat_stale', 'Stale Feature');
    const analyzer = new FeatureHealthAnalyzer();
    const ctx = HealthTestHelper.createContext({ feature });

    const health = await analyzer.analyzeFeature(ctx);
    await repo.save(health);

    const initial = await repo.getByFeatureId('feat_stale');
    expect(initial?.isStale).toBe(false);

    await repo.markStale(['feat_stale']);
    const updated = await repo.getByFeatureId('feat_stale');
    expect(updated?.isStale).toBe(true);
  });
});
