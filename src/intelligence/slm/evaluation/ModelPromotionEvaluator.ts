import { BenchmarkReport } from '../models/BenchmarkModels';

export class ModelPromotionEvaluator {
  
  public evaluateCandidate(baseline: BenchmarkReport, candidate: BenchmarkReport): {
    promoted: boolean;
    reason: string;
  } {
    // Hard rules for promotion
    
    // 1. Hallucinations must not increase by more than 1% (0.01)
    if (candidate.metrics.hallucinationRate > baseline.metrics.hallucinationRate + 0.01) {
       return { promoted: false, reason: 'Regression: Hallucination rate increased.' };
    }

    // 2. Precision must improve or stay within 2% margin if latency drastically improves
    if (candidate.metrics.contextPrecision < baseline.metrics.contextPrecision - 0.02) {
       return { promoted: false, reason: 'Regression: Context precision dropped significantly.' };
    }

    // 3. Fallback rate must not increase
    if (candidate.metrics.fallbackRate > baseline.metrics.fallbackRate) {
       return { promoted: false, reason: 'Regression: Fallback rate increased.' };
    }

    // If it survives regressions and precision is strictly better, promote.
    if (candidate.metrics.contextPrecision > baseline.metrics.contextPrecision) {
       return { promoted: true, reason: 'Promotion: Better precision with no severe regressions.' };
    }

    // Tie-breaker on latency
    if (candidate.metrics.avgLatencyMs < baseline.metrics.avgLatencyMs * 0.8) {
       return { promoted: true, reason: 'Promotion: Equivalent precision but 20%+ faster.' };
    }

    return { promoted: false, reason: 'Rejected: No significant improvement.' };
  }
}
