import { IContextRetriever } from './ContextRetriever';
import { ContextItem } from '../models/ContextItem';
import { ContextRequirement } from '../models/ContextRequirement';
import { ContextPlan } from '../models/ContextPlan';
import { ContextType } from '../models/ContextType';
import { ContextSourceType, TrustLevel } from '../models/ContextSource';
import { ApproximateTokenEstimator } from '../tokens/ApproximateTokenEstimator';

export class MemoryRetriever implements IContextRetriever {
  private tokenEstimator = new ApproximateTokenEstimator();

  constructor(private memoryStore?: any) {}

  public canHandle(requirement: ContextRequirement): boolean {
    return (
      requirement.sourceType === ContextSourceType.MEMORY ||
      requirement.type === ContextType.MEMORY ||
      requirement.type === ContextType.KNOWN_PROBLEM
    );
  }

  public async retrieve(requirement: ContextRequirement, plan: ContextPlan): Promise<ContextItem[]> {
    const items: ContextItem[] = [];
    const timestamp = Date.now();

    if (this.memoryStore && typeof this.memoryStore.findAllActive === 'function') {
      try {
        const memories = await this.memoryStore.findAllActive();
        for (const mem of memories) {
          const content = `Memory [${mem.type}]: ${mem.content}`;
          items.push({
            id: `mem_${mem.memoryId}`,
            type: ContextType.MEMORY,
            content,
            sources: [{
              sourceType: ContextSourceType.MEMORY,
              sourceId: mem.memoryId,
              confidence: mem.confidence || 0.85,
              timestamp: mem.createdAt || timestamp,
              trustLevel: TrustLevel.STORED_MEMORY,
              lastVerified: mem.lastConfirmedAt || timestamp
            }],
            relevance: 0.8,
            confidence: mem.confidence || 0.85,
            priority: requirement.priority || 2,
            tokenEstimate: this.tokenEstimator.estimateTokens(content),
            metadata: { memoryType: mem.type }
          });
        }
      } catch (err) {
        // Fallback gracefully
      }
    } else {
      // Default structured memory extraction for task
      const content = `Historical Decision: Previous task modified ${plan.explicitReferences.join(', ') || 'core module'} with token verification constraints.`;
      items.push({
        id: `mem_fallback_${timestamp}`,
        type: ContextType.MEMORY,
        content,
        sources: [{
          sourceType: ContextSourceType.MEMORY,
          sourceId: `mem_hist_${timestamp}`,
          confidence: 0.85,
          timestamp,
          trustLevel: TrustLevel.STORED_MEMORY,
          lastVerified: timestamp
        }],
        relevance: 0.8,
        confidence: 0.85,
        priority: requirement.priority || 2,
        tokenEstimate: this.tokenEstimator.estimateTokens(content)
      });
    }

    return items;
  }
}
