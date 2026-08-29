import { BenchmarkCase, SLMMetrics } from '../models/BenchmarkModels';

export class SLMMetricCalculator {
  
  public calculateMetrics(cases: BenchmarkCase[], fallbackCount: number, latencies: number[]): SLMMetrics {
    let totalPrecision = 0;
    let totalRecall = 0;
    let totalHallucinations = 0;
    
    for (const c of cases) {
       const slmPred = c.slmPrediction || [];
       const truth = new Set(c.expectedContext);
       
       // Hallucination rate
       if (c.hallucinatedEntities && c.hallucinatedEntities.length > 0) {
          totalHallucinations++;
       }

       // Precision = (Relevant Retained) / (Total Retained)
       let relevantRetained = 0;
       for (const p of slmPred) {
          if (truth.has(p)) relevantRetained++;
       }
       
       const precision = slmPred.length > 0 ? relevantRetained / slmPred.length : 0;
       totalPrecision += precision;
       
       // Recall = (Relevant Retained) / (Total Relevant)
       const recall = truth.size > 0 ? relevantRetained / truth.size : 0;
       totalRecall += recall;
    }

    const count = cases.length || 1; // avoid div by zero
    const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;

    return {
      contextPrecision: totalPrecision / count,
      contextRecall: totalRecall / count,
      missingContextRate: 1 - (totalRecall / count),
      hallucinationRate: totalHallucinations / count,
      avgLatencyMs: avgLatency,
      fallbackRate: fallbackCount / count
    };
  }
}
