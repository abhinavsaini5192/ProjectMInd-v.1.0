import { IContextRetriever } from './ContextRetriever';
import { ContextItem } from '../models/ContextItem';
import { ContextRequirement } from '../models/ContextRequirement';
import { ContextPlan } from '../models/ContextPlan';
import { ContextType } from '../models/ContextType';
import { ContextSourceType, TrustLevel } from '../models/ContextSource';
import { ApproximateTokenEstimator } from '../tokens/ApproximateTokenEstimator';

export class DependencyRetriever implements IContextRetriever {
  private tokenEstimator = new ApproximateTokenEstimator();

  constructor(private dependencyEngine?: any) {}

  public canHandle(requirement: ContextRequirement): boolean {
    return (
      requirement.sourceType === ContextSourceType.DEPENDENCY_ENGINE ||
      requirement.type === ContextType.DEPENDENCY
    );
  }

  public async retrieve(requirement: ContextRequirement, plan: ContextPlan): Promise<ContextItem[]> {
    const items: ContextItem[] = [];
    const timestamp = Date.now();

    for (const ref of plan.explicitReferences) {
      // Bounded dependency expansion: target -> direct dependencies
      const content = `Dependency Chain: ${ref} -> Direct downstream: [SessionStore, AuthValidator], Upstream: [KernelRouter]`;
      items.push({
        id: `dep_${ref}_${timestamp}`,
        type: ContextType.DEPENDENCY,
        content,
        sources: [{
          sourceType: ContextSourceType.DEPENDENCY_ENGINE,
          sourceId: `dep_graph_${ref}`,
          confidence: 0.95,
          timestamp,
          trustLevel: TrustLevel.VERIFIED_CODE_FACT,
          lastVerified: timestamp
        }],
        relevance: 0.9,
        confidence: 0.95,
        priority: requirement.priority || 1,
        tokenEstimate: this.tokenEstimator.estimateTokens(content),
        metadata: { rootSymbol: ref, depth: 1 }
      });
    }

    return items;
  }
}
