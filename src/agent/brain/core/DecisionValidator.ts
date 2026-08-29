import { BrainDecision, DecisionType } from '../models/BrainDecision';

export class DecisionValidator {
  public validate(decision: BrainDecision): { valid: boolean, reason?: string } {
    if (!decision.decisionType) return { valid: false, reason: 'Missing decisionType' };

    if (decision.confidence < 0.5 && decision.decisionType !== DecisionType.REQUEST_INFORMATION) {
       return { valid: false, reason: 'Confidence too low for autonomous action' };
    }

    if (decision.decisionType === DecisionType.MODIFY_CODE) {
       if (!decision.targets || decision.targets.length === 0) {
          return { valid: false, reason: 'MODIFY_CODE requires specific targets' };
       }
       
       for (const target of decision.targets) {
          if (target.includes('NonExistent')) { // Mocking Layer 2 graph check
             return { valid: false, reason: `Target ${target} does not exist in repository graph` };
          }
       }
    }

    return { valid: true };
  }
}
