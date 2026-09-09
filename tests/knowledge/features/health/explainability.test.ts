import { describe, it, expect } from 'vitest';
import { HealthTestHelper } from './HealthTestHelper.js';
import { FeatureHealthAnalyzer } from '../../../../src/knowledge/features/health/core/FeatureHealthAnalyzer.js';
import { FeatureHealthExplainer } from '../../../../src/knowledge/features/health/core/FeatureHealthExplainer.js';

describe('Phase 6.6 Explainability & Markdown Reporting', () => {
  it('generates structured Markdown explanation with dimensional breakdown table', async () => {
    const feature = HealthTestHelper.createFeature('feat_exp', 'Explainer Feature');
    const mapping = HealthTestHelper.createMapping('feat_exp', 'src/exp.ts', 'FILE');
    const ctx = HealthTestHelper.createContext({ feature, mappings: [mapping] });

    const analyzer = new FeatureHealthAnalyzer();
    const health = await analyzer.analyzeFeature(ctx);

    const explainer = new FeatureHealthExplainer();
    const markdown = explainer.explainHealth(health);

    expect(markdown).toContain('# Feature Health Report: feat_exp');
    expect(markdown).toContain('## Health Dimension Breakdown');
    expect(markdown).toContain('| **STRUCTURAL_HEALTH** |');
    expect(markdown).toContain('| **SECURITY_HEALTH** |');
    expect(markdown).toContain('## Active Risks');
    expect(markdown).toContain('## Actionable Recommendations');
  });

  it('redacts any sensitive secrets from generated explanations', async () => {
    const feature = HealthTestHelper.createFeature('feat_leak', 'Secret Feature');
    const analyzer = new FeatureHealthAnalyzer();
    const ctx = HealthTestHelper.createContext({ feature });
    const health = await analyzer.analyzeFeature(ctx);

    // Inject a risk containing a raw secret token to verify explainer redaction
    health.riskAssessment.risks.push({
      riskId: 'risk_leak',
      featureId: 'feat_leak',
      riskType: 'SECURITY',
      severity: 'CRITICAL',
      score: 95,
      confidence: 1.0,
      description: 'Found leaked api_key: "test_super_secret_token_value_12345" in env file',
      evidence: [],
      contributingSignals: [],
      affectedResources: [],
      detectedAt: Date.now(),
      knowledgeVersion: '6.6.0',
      active: true
    });

    const explainer = new FeatureHealthExplainer();
    const markdown = explainer.explainHealth(health);

    expect(markdown).not.toContain('test_super_secret_token_value_12345');
    expect(markdown).toContain('[REDACTED_SECRET]');
  });
});
