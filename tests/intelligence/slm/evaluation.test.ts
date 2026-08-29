import { describe, it, expect, beforeEach } from 'vitest';
import { SLMMetricCalculator } from '../../../src/intelligence/slm/evaluation/SLMMetricCalculator';
import { SLMBenchmarkRunner } from '../../../src/intelligence/slm/evaluation/SLMBenchmarkRunner';
import { ModelPromotionEvaluator } from '../../../src/intelligence/slm/evaluation/ModelPromotionEvaluator';
import { BenchmarkCase, BenchmarkReport } from '../../../src/intelligence/slm/models/BenchmarkModels';
import { SLMTaskType } from '../../../src/intelligence/slm/models/SLMTaskType';

describe('SLM Evaluation Engine (L3.6)', () => {
  let calculator: SLMMetricCalculator;
  let runner: SLMBenchmarkRunner;
  let promotionEvaluator: ModelPromotionEvaluator;

  beforeEach(() => {
    calculator = new SLMMetricCalculator();
    runner = new SLMBenchmarkRunner(calculator);
    promotionEvaluator = new ModelPromotionEvaluator();
  });

  const mockCases: BenchmarkCase[] = [
    {
      caseId: 'c1',
      taskType: SLMTaskType.FEATURE_INTERPRETATION,
      taskDescription: 'Fix auth',
      intentType: 'BUG_FIX',
      repositoryId: 'r1',
      expectedContext: ['AuthService', 'JWTService'],
      expectedFeatures: ['feat_auth'],
      slmPrediction: ['AuthService', 'JWTService', 'IrrelevantFile'],
      hallucinatedEntities: []
    },
    {
      caseId: 'c2',
      taskType: SLMTaskType.FEATURE_INTERPRETATION,
      taskDescription: 'Hallucination case',
      intentType: 'BUG_FIX',
      repositoryId: 'r1',
      expectedContext: ['Database'],
      expectedFeatures: ['feat_db'],
      slmPrediction: ['DatabaseManagerXYZ'], // Hallucinated
      hallucinatedEntities: ['DatabaseManagerXYZ']
    }
  ];

  it('should accurately calculate precision, recall, and hallucination rate', async () => {
    const report = await runner.runBenchmark(mockCases, 'modelA', '1.0');
    
    // Case 1: 2 relevant out of 3 predicted -> Precision 0.66. Recall 2/2 -> 1.0
    // Case 2: 0 relevant out of 1 predicted -> Precision 0.0. Recall 0/1 -> 0.0
    // Avg Precision = 0.33, Avg Recall = 0.5
    expect(report.metrics.contextPrecision).toBeCloseTo(0.33, 1);
    expect(report.metrics.contextRecall).toBeCloseTo(0.5, 1);
    
    // Hallucination rate: 1 case out of 2 had hallucinations
    expect(report.metrics.hallucinationRate).toBe(0.5);
  });

  it('should reject a model promotion if hallucination rate increases significantly', () => {
    const baseline: BenchmarkReport = {
      reportId: '1', model: 'A', version: '1', casesEvaluated: 100, timestamp: 0,
      metrics: { contextPrecision: 0.8, contextRecall: 0.8, hallucinationRate: 0.01, missingContextRate: 0.2, avgLatencyMs: 100, fallbackRate: 0.05 }
    };
    
    const candidate: BenchmarkReport = {
      reportId: '2', model: 'A', version: '2', casesEvaluated: 100, timestamp: 0,
      // Precision is higher, but hallucination rate jumped from 1% to 10%
      metrics: { contextPrecision: 0.9, contextRecall: 0.9, hallucinationRate: 0.1, missingContextRate: 0.1, avgLatencyMs: 100, fallbackRate: 0.05 }
    };

    const result = promotionEvaluator.evaluateCandidate(baseline, candidate);
    expect(result.promoted).toBe(false);
    expect(result.reason).toContain('Regression: Hallucination rate increased');
  });

  it('should promote a model if precision increases with no regressions', () => {
    const baseline: BenchmarkReport = {
      reportId: '1', model: 'A', version: '1', casesEvaluated: 100, timestamp: 0,
      metrics: { contextPrecision: 0.8, contextRecall: 0.8, hallucinationRate: 0.01, missingContextRate: 0.2, avgLatencyMs: 100, fallbackRate: 0.05 }
    };
    
    const candidate: BenchmarkReport = {
      reportId: '2', model: 'A', version: '2', casesEvaluated: 100, timestamp: 0,
      metrics: { contextPrecision: 0.85, contextRecall: 0.85, hallucinationRate: 0.01, missingContextRate: 0.15, avgLatencyMs: 90, fallbackRate: 0.05 }
    };

    const result = promotionEvaluator.evaluateCandidate(baseline, candidate);
    expect(result.promoted).toBe(true);
  });
});
