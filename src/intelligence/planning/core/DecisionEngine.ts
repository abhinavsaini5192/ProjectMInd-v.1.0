import { ReasoningResult } from '../../reasoning/models/ReasoningResult';
import { Decision, DecisionType, DecisionStatus } from '../models/Decision';
import { DecisionFactor } from '../models/DecisionFactor';

export class DecisionEngine {
  public evaluate(reasoning: ReasoningResult): Decision {
    const decisionId = `dec_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const factors: DecisionFactor[] = [];

    // Factor 1: Evidence strength
    const evidenceCount = reasoning.evidence.length;
    const evidenceStrength = evidenceCount > 0 ? Math.min(1.0, 0.5 + evidenceCount * 0.2) : 0.2;
    factors.push({
      type: 'EVIDENCE_STRENGTH',
      value: evidenceStrength,
      explanation: `${evidenceCount} pieces of grounded evidence cited.`
    });

    // Factor 2: Confidence
    factors.push({
      type: 'CONFIDENCE',
      value: reasoning.confidence,
      explanation: `Model and validation confidence rating: ${reasoning.confidence}.`
    });

    // Factor 3: Uncertainty
    const hasUncertainty = reasoning.uncertainty.length > 0;
    factors.push({
      type: 'UNCERTAINTY',
      value: hasUncertainty ? 0.8 : 0.1,
      explanation: hasUncertainty
        ? `Identified uncertainties: ${reasoning.uncertainty.map(u => u.type).join(', ')}`
        : 'No significant uncertainty flagged.'
    });

    // Gate 1: Insufficient Evidence or Explicit Needs Info
    const isNeedsInfo =
      reasoning.decision.status === 'NEEDS_MORE_INFORMATION' ||
      (hasUncertainty && reasoning.confidence < 0.6) ||
      (evidenceCount === 0 && reasoning.confidence < 0.7);

    let type: DecisionType = 'MODIFY';
    let status: DecisionStatus = 'VALIDATED';

    if (isNeedsInfo) {
      type = 'NEEDS_INFORMATION';
      status = 'PROPOSED';
    } else if (reasoning.decision.decisionType === 'DELETE') {
      type = 'DELETE';
    } else if (reasoning.decision.decisionType === 'CREATE_FILE') {
      type = 'CREATE';
    } else if (reasoning.decision.decisionType === 'NOOP') {
      type = 'NO_ACTION';
    } else if (reasoning.decision.status === 'RECOMMENDATION') {
      type = 'INVESTIGATE';
    } else {
      type = 'MODIFY';
    }

    const statement = reasoning.decision.summary || reasoning.conclusions[0]?.statement || 'No statement';

    return {
      decisionId,
      reasoningId: reasoning.reasoningId,
      taskId: reasoning.taskId,
      type,
      statement,
      confidence: reasoning.confidence,
      factors,
      evidenceIds: reasoning.evidence.map(e => e.evidenceId),
      alternatives: reasoning.alternatives,
      assumptions: reasoning.assumptions,
      uncertainty: reasoning.uncertainty.map(u => u.reason),
      rationale: `Decision derived from validated reasoning (${reasoning.validationStatus}) with ${factors.length} evaluation factors.`,
      status,
      createdAt: Date.now()
    };
  }
}
