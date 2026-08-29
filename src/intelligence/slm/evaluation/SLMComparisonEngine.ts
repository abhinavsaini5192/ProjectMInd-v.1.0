// SLM Comparison Engine
// Infrastructure to evaluate deterministic vs SLM vs Hybrid decisions

export class SLMComparisonEngine {
  public compare(deterministicPrediction: any, slmPrediction: any): { 
     hallucinationDetected: boolean;
     contextOverlap: number;
     hybridConfidence: number;
  } {
     
     let overlap = 0;
     for (const ctx of slmPrediction.recommendedContext) {
        if (deterministicPrediction.recommendedContext.includes(ctx)) {
           overlap++;
        }
     }
     
     const total = new Set([...slmPrediction.recommendedContext, ...deterministicPrediction.recommendedContext]).size;

     return {
        hallucinationDetected: false, // Handled by validator, but theoretically tracked here
        contextOverlap: total === 0 ? 1 : overlap / total,
        hybridConfidence: (slmPrediction.confidence * 0.4) + (deterministicPrediction.confidence * 0.6) // Deterministic weighted higher
     };
  }
}
