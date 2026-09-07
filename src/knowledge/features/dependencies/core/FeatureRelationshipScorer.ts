import type { IFeatureRelationshipScorer } from '../interfaces/IFeatureRelationshipScorer';
import type { FeatureRelationshipCandidate } from '../models/FeatureRelationshipCandidate';
import type { FeatureRelationshipConfidence } from '../models/FeatureRelationshipConfidence';
import { scoreToFeatureRelationshipConfidenceLevel } from '../models/FeatureRelationshipConfidence';
import type {
  FeatureRelationshipScoreBreakdown,
  FeatureRelationshipScoreConfig,
} from '../models/FeatureRelationshipScore';
import { DEFAULT_RELATIONSHIP_WEIGHTS } from '../models/FeatureRelationshipScore';

export class FeatureRelationshipScorer implements IFeatureRelationshipScorer {
  constructor(private config: FeatureRelationshipScoreConfig = DEFAULT_RELATIONSHIP_WEIGHTS) {}

  public scoreCandidate(candidate: FeatureRelationshipCandidate): {
    score: number;
    confidence: FeatureRelationshipConfidence;
    breakdown: FeatureRelationshipScoreBreakdown;
  } {
    const reasons: string[] = [];
    const evidence = candidate.evidence || [];

    // Group evidence by source type
    const bySource = new Map<string, number>();
    for (const ev of evidence) {
      const mult = typeof ev.strength === 'number'
        ? ev.strength
        : (this.config.strengthMultipliers[String(ev.strength)] || 0.85);
      const current = bySource.get(ev.sourceType) || 0;
      bySource.set(ev.sourceType, current + ev.confidence * mult);
    }

    const endpointCount = bySource.get('ENDPOINT') || 0;
    const codeDepCount = bySource.get('CODE_DEPENDENCY') || 0;
    const integrationCount = bySource.get('INTEGRATION') || 0;
    const architectureCount = bySource.get('ARCHITECTURE') || 0;
    const dataCount = bySource.get('DATA') || 0;
    const moduleCount = bySource.get('MODULE') || 0;
    const sharedResourceCount = bySource.get('SHARED_RESOURCE') || 0;
    const configCount = bySource.get('CONFIGURATION') || 0;
    const testCount = bySource.get('TEST') || 0;
    const historyCount = bySource.get('HISTORY') || 0;

    const endpointScore = Math.min(1.0, endpointCount) * (this.config.sourceWeights.ENDPOINT || 0.25);
    const codeDepScore = Math.min(1.0, codeDepCount) * (this.config.sourceWeights.CODE_DEPENDENCY || 0.20);
    const integrationScore = Math.min(1.0, integrationCount) * (this.config.sourceWeights.INTEGRATION || 0.15);
    const architectureScore = Math.min(1.0, architectureCount) * (this.config.sourceWeights.ARCHITECTURE || 0.12);
    const dataScore = Math.min(1.0, dataCount) * (this.config.sourceWeights.DATA || 0.10);
    const moduleScore = Math.min(1.0, moduleCount) * (this.config.sourceWeights.MODULE || 0.08);
    const sharedResourceScore = Math.min(1.0, sharedResourceCount) * (this.config.sourceWeights.SHARED_RESOURCE || 0.05);
    const configScore = Math.min(1.0, configCount) * (this.config.sourceWeights.CONFIGURATION || 0.04);
    const testScore = Math.min(1.0, testCount) * (this.config.sourceWeights.TEST || 0.03);
    const historyScore = Math.min(1.0, historyCount) * (this.config.sourceWeights.HISTORY || 0.02);

    let rawScore =
      endpointScore +
      codeDepScore +
      integrationScore +
      architectureScore +
      dataScore +
      moduleScore +
      sharedResourceScore +
      configScore +
      testScore +
      historyScore;

    // Single source baseline scaling: preserve authoritative baseline (e.g. endpoint route = 0.95)
    const maxEvidenceConfidence = Math.max(...evidence.map((e) => e.confidence), 0);
    if (maxEvidenceConfidence > 0) {
      rawScore = Math.max(rawScore, maxEvidenceConfidence);
    }

    // Source diversity bonus: if supported by 2 or more distinct sources
    const distinctSources = candidate.sources.length;
    let coherenceScore = 0;
    if (distinctSources >= 2) {
      coherenceScore = this.config.diversityBonus;
      rawScore += coherenceScore;
      reasons.push(`Cross-source diversity bonus (+${this.config.diversityBonus}) from ${distinctSources} independent sources`);
    }

    // Clamp score [0.0, 1.0]
    const finalScore = Math.min(1.0, Math.max(0.0, Math.round(rawScore * 100) / 100));

    if (endpointCount > 0) reasons.push(`API endpoint interactions contributed ${endpointScore.toFixed(2)}`);
    if (codeDepCount > 0) reasons.push(`Code dependencies contributed ${codeDepScore.toFixed(2)}`);
    if (integrationCount > 0) reasons.push(`Integration/events contributed ${integrationScore.toFixed(2)}`);
    if (architectureCount > 0) reasons.push(`Architectural layering contributed ${architectureScore.toFixed(2)}`);
    if (dataCount > 0) reasons.push(`Data/entity relationships contributed ${dataScore.toFixed(2)}`);

    const level = scoreToFeatureRelationshipConfidenceLevel(finalScore);
    const confidence: FeatureRelationshipConfidence = {
      level,
      score: finalScore,
      reasons,
    };

    const breakdown: FeatureRelationshipScoreBreakdown = {
      endpointScore,
      codeDepScore,
      integrationScore,
      architectureScore,
      dataScore,
      moduleScore,
      sharedResourceScore,
      configScore,
      testScore,
      historyScore,
      coherenceScore,
      totalScore: finalScore,
    };

    candidate.score = finalScore;
    candidate.confidence = confidence;

    return { score: finalScore, confidence, breakdown };
  }
}
