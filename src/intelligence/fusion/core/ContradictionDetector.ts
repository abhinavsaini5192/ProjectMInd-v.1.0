import { FusionContradiction } from '../models/FusionModels';

export class ContradictionDetector {
  
  // If the difference between scores is greater than 0.6, it's a strong contradiction
  private CONTRADICTION_THRESHOLD = 0.6;

  public detectAndResolve(entityId: string, detScore: number, slmScore: number, detWeight: number, slmWeight: number): FusionContradiction | null {
    
    if (Math.abs(detScore - slmScore) >= this.CONTRADICTION_THRESHOLD) {
       
       let strategy: 'DETERMINISTIC_OVERRIDE' | 'SLM_TRUSTED' | 'BLENDED' = 'BLENDED';
       
       if (detWeight >= 0.8) {
          strategy = 'DETERMINISTIC_OVERRIDE';
       } else if (slmWeight >= 0.8) {
          strategy = 'SLM_TRUSTED';
       }

       return {
         entityId,
         deterministicScore: detScore,
         slmScore: slmScore,
         resolutionStrategy: strategy,
         explanation: `Brain scored ${detScore.toFixed(2)}, SLM scored ${slmScore.toFixed(2)}. Resolved via ${strategy}.`
       };
    }

    return null;
  }
}
