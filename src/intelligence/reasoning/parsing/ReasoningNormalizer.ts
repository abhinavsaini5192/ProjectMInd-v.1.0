import { ReasoningResult } from '../models/ReasoningResult';
import { ReasoningStep } from '../models/ReasoningStep';

export class ReasoningNormalizer {
  public normalize(raw: any, taskId: string, modelId: string, contextPackageId: string): Partial<ReasoningResult> {
    const observations = this.normalizeSteps(raw.observations, 'OBSERVATION');
    const hypotheses = this.normalizeSteps(raw.hypotheses, 'HYPOTHESIS');

    const conclusions = Array.isArray(raw.conclusions)
      ? raw.conclusions.map((c: any) => ({
          statement: typeof c === 'string' ? c : c.statement || '',
          evidenceIds: Array.isArray(c.evidenceIds) ? c.evidenceIds : (Array.isArray(c.evidence) ? c.evidence : []),
          confidence: this.clampConfidence(c.confidence ?? 0.7),
          assumptions: Array.isArray(c.assumptions) ? c.assumptions : [],
          uncertainty: typeof c.uncertainty === 'string' ? c.uncertainty : undefined
        }))
      : [];

    const evidence = Array.isArray(raw.evidence)
      ? raw.evidence.map((e: any, idx: number) => ({
          evidenceId: e.evidenceId || `ev_${idx + 1}`,
          type: e.type || 'CONTEXT',
          sourceId: e.sourceId || e.id || 'unknown',
          claim: e.claim || e.statement || '',
          confidence: this.clampConfidence(e.confidence ?? 0.8)
        }))
      : [];

    const assumptions = Array.isArray(raw.assumptions)
      ? raw.assumptions.map(String)
      : [];

    const alternatives = Array.isArray(raw.alternatives)
      ? raw.alternatives.map(String)
      : [];

    const uncertainty = Array.isArray(raw.uncertainty)
      ? raw.uncertainty.map((u: any) => ({
          type: u.type || 'UNKNOWN',
          reason: typeof u === 'string' ? u : u.reason || 'Uncertainty noted',
          missingInformation: Array.isArray(u.missingInformation) ? u.missingInformation : []
        }))
      : [];

    const recommendations = Array.isArray(raw.recommendations)
      ? raw.recommendations.map(String)
      : [];

    const decision = {
      status: raw.decision?.status || (conclusions.length > 0 ? 'READY_FOR_EXECUTION' : 'NO_DECISION'),
      decisionType: raw.decision?.decisionType || raw.decision?.type || raw.decisionType || 'MODIFY_CODE',
      targets: Array.isArray(raw.decision?.targets) ? raw.decision.targets : (Array.isArray(raw.targets) ? raw.targets : []),
      actions: Array.isArray(raw.decision?.actions) ? raw.decision.actions : (Array.isArray(raw.actions) ? raw.actions : []),
      constraints: Array.isArray(raw.decision?.constraints) ? raw.decision.constraints : (Array.isArray(raw.constraints) ? raw.constraints : []),
      requiredVerification: Array.isArray(raw.decision?.requiredVerification) ? raw.decision.requiredVerification : (Array.isArray(raw.requiredVerification) ? raw.requiredVerification : []),
      summary: raw.decision?.summary || raw.reasoningSummary || (conclusions[0]?.statement || 'No summary provided')
    };

    const overallConfidence = this.clampConfidence(
      raw.confidence ?? (conclusions.length > 0 ? conclusions[0].confidence : 0.5)
    );

    return {
      reasoningId: `rsn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      taskId,
      modelId,
      contextPackageId,
      promptVersion: '1.0',
      observations,
      evidence,
      hypotheses,
      conclusions,
      assumptions,
      alternatives,
      uncertainty,
      recommendations,
      decision,
      plan: raw.plan ? {
        planId: raw.plan.planId || `rplan_${Date.now()}`,
        title: raw.plan.title || 'Reasoning Action Plan',
        steps: Array.isArray(raw.plan.steps) ? raw.plan.steps : []
      } : undefined,
      confidence: overallConfidence,
      schemaVersion: '1.0',
      strategyVersion: '1.0',
      createdAt: Date.now()
    };
  }

  private normalizeSteps(steps: any, defaultType: any): ReasoningStep[] {
    if (!Array.isArray(steps)) return [];
    return steps.map((s: any, idx: number) => ({
      stepNumber: s.stepNumber || idx + 1,
      type: s.type || defaultType,
      statement: typeof s === 'string' ? s : s.statement || '',
      evidenceIds: Array.isArray(s.evidenceIds) ? s.evidenceIds : (Array.isArray(s.evidence) ? s.evidence : []),
      confidence: this.clampConfidence(s.confidence ?? 0.8)
    }));
  }

  private clampConfidence(val: any): number {
    const num = Number(val);
    if (isNaN(num)) return 0.5;
    return Number(Math.max(0.0, Math.min(1.0, num)).toFixed(2));
  }
}
