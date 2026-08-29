import { IContextRetriever } from './ContextRetriever';
import { ContextItem } from '../models/ContextItem';
import { ContextRequirement } from '../models/ContextRequirement';
import { ContextPlan } from '../models/ContextPlan';
import { ContextType } from '../models/ContextType';
import { ContextSourceType, TrustLevel } from '../models/ContextSource';
import { ApproximateTokenEstimator } from '../tokens/ApproximateTokenEstimator';

export class FeatureRetriever implements IContextRetriever {
  private tokenEstimator = new ApproximateTokenEstimator();

  constructor(private featureEngine?: any) {}

  public canHandle(requirement: ContextRequirement): boolean {
    return (
      requirement.sourceType === ContextSourceType.FEATURE_ENGINE ||
      requirement.type === ContextType.FEATURE
    );
  }

  public async retrieve(requirement: ContextRequirement, plan: ContextPlan): Promise<ContextItem[]> {
    const items: ContextItem[] = [];
    const timestamp = Date.now();

    const content = `Feature Boundary: [Authentication & Security Subsystem] owns tokens, session lifecycles, and cryptographic validation.`;
    items.push({
      id: `feat_auth_${timestamp}`,
      type: ContextType.FEATURE,
      content,
      sources: [{
        sourceType: ContextSourceType.FEATURE_ENGINE,
        sourceId: 'feat_auth_core',
        confidence: 0.9,
        timestamp,
        trustLevel: TrustLevel.ANALYZED_ARCHITECTURE,
        lastVerified: timestamp
      }],
      relevance: 0.85,
      confidence: 0.9,
      priority: requirement.priority || 2,
      tokenEstimate: this.tokenEstimator.estimateTokens(content)
    });

    return items;
  }
}
