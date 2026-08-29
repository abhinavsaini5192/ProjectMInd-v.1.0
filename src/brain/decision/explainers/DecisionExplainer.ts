import { Decision } from '../models/Decision';

export class DecisionExplainer {
  public explain(decision: Decision): string[] {
    const reasons: string[] = [];

    reasons.push(`Task mapped to intent ${decision.intent.type} with ${(decision.intent.confidence * 100).toFixed(0)}% confidence.`);
    reasons.push(`Resolved target features: ${decision.targetFeatures.join(', ')}.`);
    reasons.push(`Risk calculated as ${decision.risk.level} because: ${decision.risk.factors.join(', ')}.`);
    reasons.push(`Selected ${decision.requiredContext.length} required context items, excluded ${decision.excludedContext.length} items for security.`);
    
    return reasons;
  }
}
