import type { BehaviorContext, IFeatureBehaviorSource } from '../interfaces/IFeatureBehaviorSource';
import type { FeatureBehaviorCandidate } from '../models/FeatureBehaviorCandidate';
import { BehaviorSourceHelper } from './BehaviorSourceHelper';

export class IntegrationFlowSource implements IFeatureBehaviorSource {
  public readonly sourceId = 'INTEGRATION_FLOW_SOURCE';
  public readonly sourceType = 'EXTERNAL';
  public readonly priority = 70;

  private static readonly INTEGRATION_KEYWORDS = [
    'stripe',
    'paypal',
    'sendgrid',
    'twilio',
    'aws',
    's3',
    'ses',
    'sns',
    'sqs',
    'github',
    'google',
    'oauth',
    'auth0',
    'firebase',
    'slack',
    'webhook',
    'httpclient',
  ];

  public async extractBehavior(context: BehaviorContext): Promise<FeatureBehaviorCandidate[]> {
    const candidates: FeatureBehaviorCandidate[] = [];
    const featureId = context.feature.id;

    // Check mapped dependencies or symbols matching integration keywords
    const integrationMappings = context.mappings.filter(m => {
      if (m.active === false) return false;
      const lower = m.resourceId.toLowerCase();
      return (
        m.resourceType === 'DEPENDENCY' ||
        m.resourceType === 'PACKAGE' ||
        IntegrationFlowSource.INTEGRATION_KEYWORDS.some(kw => lower.includes(kw))
      );
    });

    for (const m of integrationMappings) {
      const isThirdParty = IntegrationFlowSource.INTEGRATION_KEYWORDS.some(kw =>
        m.resourceId.toLowerCase().includes(kw)
      );

      if (isThirdParty) {
        const ev = BehaviorSourceHelper.createEvidence(
          this.sourceType,
          this.sourceId,
          'THIRD_PARTY_INTEGRATION_DETECTED',
          `Third-party integration with ${m.resourceId}`,
          0.85,
          { provider: m.resourceId }
        );

        const node = BehaviorSourceHelper.createNode(
          m.resourceId,
          m.resourceType,
          'EXTERNAL_SERVICE',
          `External: ${m.resourceId}`,
          {
            externalService: true,
            provider: m.resourceId,
          },
          0.85
        );

        candidates.push(
          BehaviorSourceHelper.createCandidate(
            featureId,
            `External Integration: ${m.resourceId}`,
            'INTEGRATION',
            [node],
            [],
            [ev],
            this.sourceId,
            0.85,
            { externalService: true }
          )
        );
      }
    }

    return candidates;
  }
}
