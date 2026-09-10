import type { IImpactScorer } from '../interfaces/IImpactScorer.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import type { FeatureImpact } from '../models/FeatureImpact.js';
import type { ImpactContext } from '../interfaces/IImpactSource.js';
import { confidenceToNumeric } from '../models/ImpactConfidence.js';

export class ImpactScorer implements IImpactScorer {
  public scoreImpact(candidate: ImpactCandidate, context: ImpactContext): number {
    // 1. Base score
    let score = candidate.direct ? 85 : 70;

    // 2. Distance penalty (-15 per distance hop)
    if (candidate.distance > 0) {
      score -= candidate.distance * 15;
    }

    // 3. Evidence quality & count bonus
    const confNumeric = confidenceToNumeric(candidate.confidence);
    score += Math.round((confNumeric - 0.5) * 20); // -10 to +10

    const uniqueSources = new Set(candidate.evidence.map((e) => e.source)).size;
    if (uniqueSources > 1) {
      score += Math.min(10, (uniqueSources - 1) * 5);
    }

    // 4. Change type severity bonus
    const primaryChange = candidate.contributingChanges[0];
    if (primaryChange) {
      const isCriticalChange =
        candidate.impactType === 'API' ||
        candidate.impactType === 'DATA' ||
        candidate.evidence.some((e) => e.evidenceType.includes('SCHEMA') || e.evidenceType.includes('ENDPOINT'));

      if (isCriticalChange) {
        score += 8;
      }
    }

    // 5. Health & Criticality prioritization (Section 26 & 28)
    if (context.config.enableHealthPrioritization && candidate.targetFeatureId) {
      const health = context.health.get(candidate.targetFeatureId);
      if (health) {
        const critLevel = health.criticality?.level;
        if (critLevel === 'CRITICAL') {
          score += 15;
        } else if (critLevel === 'HIGH') {
          score += 10;
        } else if (critLevel === 'MEDIUM') {
          score += 5;
        }

        const riskScore = health.riskAssessment?.overallRiskScore ?? 0;
        if (riskScore >= 70) {
          score += 8;
        } else if (riskScore >= 50) {
          score += 4;
        }
      }
    }

    // 6. Clamp to 0..100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  public prioritizeImpacts(impacts: FeatureImpact[]): FeatureImpact[] {
    return [...impacts].sort((a, b) => {
      // 1. Score descending
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // 2. Direct impacts outrank indirect
      if (a.direct !== b.direct) {
        return a.direct ? -1 : 1;
      }
      // 3. Distance ascending
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      // 4. Alphabetical fallback for deterministic order
      return a.targetFeatureId.localeCompare(b.targetFeatureId);
    });
  }
}
