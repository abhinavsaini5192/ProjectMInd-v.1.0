import type { BehaviorContext, IFeatureBehaviorSource } from '../interfaces/IFeatureBehaviorSource';
import type { FeatureBehaviorCandidate } from '../models/FeatureBehaviorCandidate';
import { BehaviorSourceHelper } from './BehaviorSourceHelper';

export class ValidationFlowSource implements IFeatureBehaviorSource {
  public readonly sourceId = 'VALIDATION_FLOW_SOURCE';
  public readonly sourceType = 'VALIDATION';
  public readonly priority = 82;

  public async extractBehavior(context: BehaviorContext): Promise<FeatureBehaviorCandidate[]> {
    const candidates: FeatureBehaviorCandidate[] = [];
    const featureId = context.feature.id;

    const validationMappings = context.mappings.filter(m => {
      if (m.active === false) return false;
      const lower = m.resourceId.toLowerCase();
      return (
        lower.includes('validation') ||
        lower.includes('validator') ||
        lower.includes('schema') ||
        lower.includes('validate') ||
        m.metadata?.role === 'VALIDATOR'
      );
    });

    for (const m of validationMappings) {
      const ev = BehaviorSourceHelper.createEvidence(
        this.sourceType,
        this.sourceId,
        'VALIDATION_STAGE_DETECTED',
        `Validation logic detected in ${m.resourceId}`,
        0.87
      );

      const node = BehaviorSourceHelper.createNode(
        m.resourceId,
        m.resourceType,
        'VALIDATION',
        `Validation: ${m.resourceId}`,
        { validationTarget: m.resourceId },
        0.87
      );

      candidates.push(
        BehaviorSourceHelper.createCandidate(
          featureId,
          `Validation Flow: ${m.resourceId}`,
          'VALIDATION',
          [node],
          [],
          [ev],
          this.sourceId,
          0.87
        )
      );
    }

    return candidates;
  }
}
