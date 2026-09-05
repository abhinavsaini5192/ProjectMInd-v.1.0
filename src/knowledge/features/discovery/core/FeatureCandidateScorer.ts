import type { IFeatureCandidateScorer, ScoreBreakdown } from '../interfaces/IFeatureCandidateScorer';
import type { FeatureCandidate } from '../models/FeatureCandidate';
import type { DiscoveryConfidence } from '../models/DiscoveryConfidence';
import { scoreToConfidenceLevel } from '../models/DiscoveryConfidence';
import type { EvidenceWeightConfig } from '../ranking/EvidenceWeight';
import { DEFAULT_EVIDENCE_WEIGHTS } from '../ranking/EvidenceWeight';

export class FeatureCandidateScorer implements IFeatureCandidateScorer {
  constructor(private config: EvidenceWeightConfig = DEFAULT_EVIDENCE_WEIGHTS) {}

  public scoreCandidate(candidate: FeatureCandidate): { score: number; confidence: DiscoveryConfidence; breakdown: ScoreBreakdown } {
    const reasons: string[] = [];
    const evidence = candidate.evidence;

    // Group evidence by source type
    const bySource = new Map<string, number>();
    for (const ev of evidence) {
      const strengthMult = this.config.strengthMultipliers[ev.strength] || 0.5;
      const current = bySource.get(ev.sourceType) || 0;
      bySource.set(ev.sourceType, current + ev.confidence * strengthMult);
    }

    const endpointCount = bySource.get('ENDPOINT') || 0;
    const symbolCount = bySource.get('SYMBOL') || 0;
    const testCount = bySource.get('TEST') || 0;
    const dependencyCount = bySource.get('DEPENDENCY') || 0;
    const moduleCount = bySource.get('MODULE') || 0;
    const configCount = bySource.get('CONFIGURATION') || 0;
    const docCount = bySource.get('DOCUMENTATION') || 0;
    const historyCount = bySource.get('HISTORY') || 0;

    const endpointScore = Math.min(1.0, endpointCount) * this.config.sourceWeights.ENDPOINT;
    const symbolScore = Math.min(1.0, symbolCount) * this.config.sourceWeights.SYMBOL;
    const testScore = Math.min(1.0, testCount) * this.config.sourceWeights.TEST;
    const dependencyScore = Math.min(1.0, dependencyCount) * this.config.sourceWeights.DEPENDENCY;
    const moduleScore = Math.min(1.0, moduleCount) * this.config.sourceWeights.MODULE;
    const configScore = Math.min(1.0, configCount) * this.config.sourceWeights.CONFIGURATION;
    const docScore = Math.min(1.0, docCount) * this.config.sourceWeights.DOCUMENTATION;
    const historyScore = Math.min(1.0, historyCount) * this.config.sourceWeights.HISTORY;

    let totalScore =
      endpointScore +
      symbolScore +
      testScore +
      dependencyScore +
      moduleScore +
      configScore +
      docScore +
      historyScore;

    // Diversity bonus: if evidence originates from 3 or more distinct sources, award bonus
    const distinctSourcesCount = candidate.sources.length;
    let coherenceScore = 0;
    if (distinctSourcesCount >= 3) {
      coherenceScore = this.config.diversityBonus;
      totalScore += coherenceScore;
      reasons.push(`High source diversity (${distinctSourcesCount} distinct sources) added ${this.config.diversityBonus} bonus`);
    }

    // Normalization clamp [0.0, 1.0]
    totalScore = Math.min(1.0, Math.max(0.0, Math.round(totalScore * 100) / 100));

    if (endpointCount > 0) reasons.push(`Direct API endpoints contributed ${endpointScore.toFixed(2)}`);
    if (symbolCount > 0) reasons.push(`Symbols contributed ${symbolScore.toFixed(2)}`);
    if (testCount > 0) reasons.push(`Test suites contributed ${testScore.toFixed(2)}`);
    if (dependencyCount > 0) reasons.push(`Component dependency chains contributed ${dependencyScore.toFixed(2)}`);
    if (configCount > 0) reasons.push(`Configuration keys contributed ${configScore.toFixed(2)}`);

    const level = scoreToConfidenceLevel(totalScore);
    const confidence: DiscoveryConfidence = {
      level,
      score: totalScore,
      reasons,
    };

    const breakdown: ScoreBreakdown = {
      endpointScore,
      symbolScore,
      dependencyScore,
      moduleScore,
      testScore,
      configScore,
      docScore,
      historyScore,
      coherenceScore,
      totalScore,
    };

    candidate.score = totalScore;
    candidate.confidence = confidence;

    return { score: totalScore, confidence, breakdown };
  }
}
