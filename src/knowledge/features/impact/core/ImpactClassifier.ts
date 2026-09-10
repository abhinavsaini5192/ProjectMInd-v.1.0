import type { IImpactClassifier } from '../interfaces/IImpactClassifier.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import type { ImpactType } from '../models/ImpactType.js';
import type { ImpactSeverity } from '../models/ImpactSeverity.js';
import type { ImpactConfidence } from '../models/ImpactConfidence.js';
import type { ImpactEvidence } from '../models/ImpactEvidence.js';
import type { ImpactContext } from '../interfaces/IImpactSource.js';
import { numericToConfidence } from '../models/ImpactConfidence.js';

export class ImpactClassifier implements IImpactClassifier {
  public classifyType(candidate: ImpactCandidate, context: ImpactContext): ImpactType {
    if (candidate.direct) {
      if (candidate.impactType === 'API') return 'API';
      if (candidate.impactType === 'DATA') return 'DATA';
      if (candidate.impactType === 'BEHAVIORAL') return 'BEHAVIORAL';
      return 'DIRECT';
    }
    return candidate.impactType || 'INDIRECT';
  }

  public classifySeverity(
    candidate: ImpactCandidate,
    score: number,
    context: ImpactContext
  ): ImpactSeverity {
    if (candidate.impactType === 'VERIFICATION') {
      return score >= 75 ? 'MEDIUM' : 'LOW';
    }

    // Check target feature criticality if available
    let isCriticalFeature = false;
    if (candidate.targetFeatureId) {
      const health = context.health.get(candidate.targetFeatureId);
      if (health?.criticality?.level === 'CRITICAL') {
        isCriticalFeature = true;
      }
    }

    if (score >= 85 || (score >= 75 && isCriticalFeature)) {
      return 'CRITICAL';
    }
    if (score >= 70 || (score >= 60 && candidate.direct)) {
      return 'HIGH';
    }
    if (score >= 45) {
      return 'MEDIUM';
    }
    if (score >= 20) {
      return 'LOW';
    }
    return 'INFO';
  }

  public classifyConfidence(evidence: ImpactEvidence[]): ImpactConfidence {
    if (!evidence || evidence.length === 0) return 'UNKNOWN';

    // Average confidence across evidence items
    const sum = evidence.reduce((acc, e) => acc + (e.confidence ?? 0.5), 0);
    const avg = sum / evidence.length;

    // Bonus for multi-source confirmation
    const uniqueSources = new Set(evidence.map((e) => e.source)).size;
    const multiSourceBonus = uniqueSources > 1 ? 0.05 * (uniqueSources - 1) : 0;

    return numericToConfidence(Math.min(1, avg + multiSourceBonus));
  }
}
