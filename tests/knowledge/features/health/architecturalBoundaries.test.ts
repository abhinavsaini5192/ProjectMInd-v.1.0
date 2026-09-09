import { describe, it, expect } from 'vitest';
import { HealthTestHelper } from './HealthTestHelper.js';
import { FeatureHealthAnalyzer } from '../../../../src/knowledge/features/health/core/FeatureHealthAnalyzer.js';
import { FeatureHealthEngine } from '../../../../src/knowledge/features/health/core/FeatureHealthEngine.js';

describe('Phase 6.6 Architectural Boundaries & Read-Only Invariant', () => {
  it('operates in strictly read-only mode and preserves original context objects', async () => {
    const feature = HealthTestHelper.createFeature('feat_readonly', 'Read Only Feature');
    const mapping = HealthTestHelper.createMapping('feat_readonly', 'src/file.ts', 'FILE');
    const ctx = HealthTestHelper.createContext({ feature, mappings: [mapping] });

    const originalFeatureSnapshot = JSON.stringify(feature);
    const originalMappingSnapshot = JSON.stringify(mapping);

    const analyzer = new FeatureHealthAnalyzer();
    const health = await analyzer.analyzeFeature(ctx);

    // Verify context inputs remain unmodified
    expect(JSON.stringify(feature)).toBe(originalFeatureSnapshot);
    expect(JSON.stringify(mapping)).toBe(originalMappingSnapshot);
    expect(health).toBeDefined();
  });

  it('runs analysis deterministically with pure scoring', async () => {
    const feature = HealthTestHelper.createFeature('feat_det', 'Deterministic Feature');
    const mapping = HealthTestHelper.createMapping('feat_det', 'src/det.ts', 'FILE');
    const ctx = HealthTestHelper.createContext({ feature, mappings: [mapping] });

    const analyzer = new FeatureHealthAnalyzer();
    const run1 = await analyzer.analyzeFeature(ctx);
    const run2 = await analyzer.analyzeFeature(ctx);

    expect(run1.healthScore.overallScore).toBe(run2.healthScore.overallScore);
    expect(run1.healthScore.status).toBe(run2.healthScore.status);
    expect(run1.riskAssessment.overallRiskScore).toBe(run2.riskAssessment.overallRiskScore);
  });
});
