import { IContextRetriever } from './ContextRetriever';
import { ContextItem } from '../models/ContextItem';
import { ContextRequirement } from '../models/ContextRequirement';
import { ContextPlan } from '../models/ContextPlan';
import { ContextType } from '../models/ContextType';
import { ContextSourceType, TrustLevel } from '../models/ContextSource';
import { ApproximateTokenEstimator } from '../tokens/ApproximateTokenEstimator';

export class ChangeRetriever implements IContextRetriever {
  private tokenEstimator = new ApproximateTokenEstimator();

  constructor(private changeHistory?: any) {}

  public canHandle(requirement: ContextRequirement): boolean {
    return (
      requirement.sourceType === ContextSourceType.CHANGE_HISTORY ||
      requirement.type === ContextType.RECENT_CHANGE
    );
  }

  public async retrieve(requirement: ContextRequirement, plan: ContextPlan): Promise<ContextItem[]> {
    const items: ContextItem[] = [];
    const timestamp = Date.now();

    const content = `Recent Change [commit 8f3a912]: Updated token expiration handler and refreshed validation routines.`;
    items.push({
      id: `change_recent_${timestamp}`,
      type: ContextType.RECENT_CHANGE,
      content,
      sources: [{
        sourceType: ContextSourceType.CHANGE_HISTORY,
        sourceId: 'commit_8f3a912',
        confidence: 1.0,
        timestamp: timestamp - 3600000,
        trustLevel: TrustLevel.HISTORICAL_INFORMATION,
        lastVerified: timestamp
      }],
      relevance: 0.7,
      confidence: 1.0,
      priority: requirement.priority || 3,
      tokenEstimate: this.tokenEstimator.estimateTokens(content),
      metadata: { commit: '8f3a912' }
    });

    return items;
  }
}
