import { describe, it, expect } from 'vitest';
import { HealthTestHelper } from './HealthTestHelper.js';
import { FeatureHealthScorer } from '../../../../src/knowledge/features/health/core/FeatureHealthScorer.js';

describe('Phase 6.6 Criticality & Stability Evaluation', () => {
  const scorer = new FeatureHealthScorer();

  it('evaluates high criticality for core domain features with multiple dependents and endpoints', () => {
    const feature = HealthTestHelper.createFeature('feat_auth', 'Authentication Service', {
      type: 'CORE'
    });
    const ep1 = HealthTestHelper.createMapping('feat_auth', '/auth/login', 'ENDPOINT');
    const ep2 = HealthTestHelper.createMapping('feat_auth', '/auth/refresh', 'ENDPOINT');
    const sym = HealthTestHelper.createMapping('feat_auth', 'TokenService', 'SYMBOL');
    const dep1 = HealthTestHelper.createDependency('feat_checkout', 'feat_auth');
    const dep2 = HealthTestHelper.createDependency('feat_profile', 'feat_auth');
    const dep3 = HealthTestHelper.createDependency('feat_admin', 'feat_auth');

    const ctx = HealthTestHelper.createContext({
      feature,
      mappings: [ep1, ep2, sym],
      dependents: [dep1, dep2, dep3]
    });

    const crit = scorer.calculateCriticality(ctx);
    expect(crit.level).toBe('CRITICAL');
    expect(crit.score).toBeGreaterThanOrEqual(75);
    expect(crit.metrics.coreDomain).toBe(true);
    expect(crit.metrics.endpointCount).toBe(2);
    expect(crit.metrics.dependentCount).toBe(3);
  });

  it('evaluates low criticality for isolated peripheral features', () => {
    const feature = HealthTestHelper.createFeature('feat_about', 'About Page', {
      type: 'DOCUMENTATION'
    });
    const docMap = HealthTestHelper.createMapping('feat_about', 'about.html', 'DOCUMENTATION');

    const ctx = HealthTestHelper.createContext({
      feature,
      mappings: [docMap]
    });

    const crit = scorer.calculateCriticality(ctx);
    expect(crit.level).toBe('LOW');
    expect(crit.score).toBeLessThan(25);
    expect(crit.metrics.coreDomain).toBe(false);
  });

  it('evaluates stability levels correctly based on churn and commits', () => {
    const stableFeature = HealthTestHelper.createFeature('feat_stable', 'Stable Feature', {
      metadata: { commitCount: 5, churnScore: 2, recentChangesCount: 1 }
    });
    const stableCtx = HealthTestHelper.createContext({ feature: stableFeature });
    const stableRes = scorer.calculateStability(stableCtx, []);
    expect(stableRes.level).toBe('STABLE');
    expect(stableRes.score).toBeGreaterThanOrEqual(80);

    const unstableFeature = HealthTestHelper.createFeature('feat_vol', 'Volatile Feature', {
      metadata: {
        commitCount: 45,
        churnScore: 30,
        recentChangesCount: 20,
        recentBreakingChange: true
      }
    });
    const unstableCtx = HealthTestHelper.createContext({ feature: unstableFeature });
    const unstableRes = scorer.calculateStability(unstableCtx, []);
    expect(unstableRes.level).toBe('HIGHLY_UNSTABLE');
    expect(unstableRes.score).toBeLessThan(35);
  });
});
