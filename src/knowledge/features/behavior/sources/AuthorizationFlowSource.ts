import type { BehaviorContext, IFeatureBehaviorSource } from '../interfaces/IFeatureBehaviorSource';
import type { FeatureBehaviorCandidate } from '../models/FeatureBehaviorCandidate';
import { BehaviorSourceHelper } from './BehaviorSourceHelper';

export class AuthorizationFlowSource implements IFeatureBehaviorSource {
  public readonly sourceId = 'AUTHORIZATION_FLOW_SOURCE';
  public readonly sourceType = 'SECURITY';
  public readonly priority = 83;

  public async extractBehavior(context: BehaviorContext): Promise<FeatureBehaviorCandidate[]> {
    const candidates: FeatureBehaviorCandidate[] = [];
    const featureId = context.feature.id;

    const authMappings = context.mappings.filter(m => {
      if (m.active === false) return false;
      const lower = m.resourceId.toLowerCase();
      return (
        lower.includes('authguard') ||
        lower.includes('authorize') ||
        lower.includes('permission') ||
        lower.includes('role') ||
        lower.includes('sessiongate') ||
        lower.includes('jwtverifier') ||
        m.metadata?.role === 'GUARD'
      );
    });

    for (const m of authMappings) {
      const ev = BehaviorSourceHelper.createEvidence(
        this.sourceType,
        this.sourceId,
        'AUTHORIZATION_STAGE_DETECTED',
        `Authorization check detected in ${m.resourceId}`,
        0.89
      );

      const node = BehaviorSourceHelper.createNode(
        m.resourceId,
        m.resourceType,
        'AUTHORIZATION',
        `Authorization: ${m.resourceId}`,
        { authTarget: m.resourceId },
        0.89
      );

      candidates.push(
        BehaviorSourceHelper.createCandidate(
          featureId,
          `Authorization Flow: ${m.resourceId}`,
          'AUTHORIZATION',
          [node],
          [],
          [ev],
          this.sourceId,
          0.89
        )
      );
    }

    return candidates;
  }
}
