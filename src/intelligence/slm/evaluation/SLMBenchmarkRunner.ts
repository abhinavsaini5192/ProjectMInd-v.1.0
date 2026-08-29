import { BenchmarkCase, BenchmarkReport, SLMMetrics } from '../models/BenchmarkModels';
import { SLMMetricCalculator } from './SLMMetricCalculator';

export class SLMBenchmarkRunner {
  constructor(private calculator: SLMMetricCalculator) {}

  public async runBenchmark(cases: BenchmarkCase[], modelId: string, version: string): Promise<BenchmarkReport> {
    
    // In a real implementation, this would orchestrate the SLMGateway for each case.
    // For now, we simulate execution assuming the predictions are already attached to the case object for testing.
    
    // Calculate fallback count
    let fallbackCount = 0;
    const latencies: number[] = [];

    for (const c of cases) {
       // Mock latency and fallback detection based on deterministic vs SLM prediction arrays
       latencies.push(40 + Math.random() * 20); 
       if (!c.slmPrediction || c.slmPrediction.length === 0) {
          fallbackCount++;
       }
    }

    const metrics = this.calculator.calculateMetrics(cases, fallbackCount, latencies);

    return {
      reportId: `bench_${Date.now()}`,
      model: modelId,
      version: version,
      metrics: metrics,
      casesEvaluated: cases.length,
      timestamp: Date.now()
    };
  }
}
