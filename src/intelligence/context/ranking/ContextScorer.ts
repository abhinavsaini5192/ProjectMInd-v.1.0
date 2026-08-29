import { ContextItem } from '../models/ContextItem';
import { ContextPlan } from '../models/ContextPlan';
import { TrustLevel } from '../models/ContextSource';

export interface ScoreBreakdown {
  taskRelevance: number;
  explicitMention: number;
  dependencyProximity: number;
  trustWeight: number;
  recencyWeight: number;
  finalScore: number;
}

export class ContextScorer {
  public calculateScore(item: ContextItem, plan: ContextPlan): ScoreBreakdown {
    let taskRelevance = item.relevance || 0.5;
    let explicitMention = 0.0;
    let dependencyProximity = 0.0;
    let trustWeight = 0.5;
    let recencyWeight = 0.5;

    // Check explicit mentions
    const lowerContent = item.content.toLowerCase();
    for (const ref of plan.explicitReferences) {
      if (lowerContent.includes(ref.toLowerCase())) {
        explicitMention += 0.4;
      }
    }
    explicitMention = Math.min(explicitMention, 1.0);

    // Dependency proximity
    if (item.metadata?.depth !== undefined) {
      dependencyProximity = Math.max(0, 1.0 - (item.metadata.depth * 0.3));
    } else if (item.type === 'DEPENDENCY' || item.type === 'SYMBOL') {
      dependencyProximity = 0.7;
    }

    // Trust weights based on source verification
    if (item.sources && item.sources.length > 0) {
      const primaryTrust = item.sources[0].trustLevel;
      switch (primaryTrust) {
        case TrustLevel.VERIFIED_CODE_FACT:
          trustWeight = 1.0;
          break;
        case TrustLevel.ANALYZED_ARCHITECTURE:
          trustWeight = 0.85;
          break;
        case TrustLevel.STORED_MEMORY:
          trustWeight = 0.75;
          break;
        case TrustLevel.HISTORICAL_INFORMATION:
          trustWeight = 0.65;
          break;
        case TrustLevel.INFERRED_INFORMATION:
        default:
          trustWeight = 0.5;
          break;
      }

      // Recency calculation
      const ageHours = (Date.now() - item.sources[0].timestamp) / (1000 * 60 * 60);
      if (ageHours < 24) {
        recencyWeight = 1.0;
      } else if (ageHours < 168) { // 1 week
        recencyWeight = 0.8;
      } else {
        recencyWeight = 0.6;
      }
    }

    // Final deterministic weighted score calculation
    // Priority multiplier (Priority 1 gives 1.0, Priority 5 gives 0.6)
    const priorityMultiplier = Math.max(0.2, 1.0 - ((item.priority - 1) * 0.1));

    const weightedScore = (
      taskRelevance * 0.30 +
      explicitMention * 0.35 +
      dependencyProximity * 0.15 +
      trustWeight * 0.10 +
      recencyWeight * 0.10
    ) * priorityMultiplier;

    const finalScore = Number(Math.min(1.0, Math.max(0.0, weightedScore)).toFixed(4));

    return {
      taskRelevance,
      explicitMention,
      dependencyProximity,
      trustWeight,
      recencyWeight,
      finalScore
    };
  }
}
