import type { IFeatureMappingScorer } from '../interfaces/IFeatureMappingScorer';
import type { MappingCandidate } from '../models/MappingCandidate';
import type { MappingConfidence } from '../models/MappingConfidence';
import { scoreToMappingConfidenceLevel } from '../models/MappingConfidence';
import type { MappingScoreBreakdown, MappingScoreConfig } from '../models/MappingScore';
import { DEFAULT_MAPPING_WEIGHTS } from '../models/MappingScore';

export class FeatureMappingScorer implements IFeatureMappingScorer {
  constructor(private config: MappingScoreConfig = DEFAULT_MAPPING_WEIGHTS) {}

  public scoreCandidate(candidate: MappingCandidate): {
    score: number;
    confidence: MappingConfidence;
    breakdown: MappingScoreBreakdown;
  } {
    const reasons: string[] = [];
    const evidence = candidate.evidence || [];

    // Group evidence by source type
    const bySource = new Map<string, number>();
    for (const ev of evidence) {
      const strengthMult = typeof ev.strength === 'number'
        ? ev.strength
        : (this.config.strengthMultipliers[String(ev.strength)] || 0.8);
      const current = bySource.get(ev.sourceType) || 0;
      bySource.set(ev.sourceType, current + ev.confidence * strengthMult);
    }

    const endpointCount = bySource.get('ENDPOINT') || 0;
    const symbolCount = bySource.get('SYMBOL') || 0;
    const testCount = bySource.get('TEST') || 0;
    const dependencyCount = bySource.get('DEPENDENCY') || 0;
    const dbCount = (bySource.get('DATABASE') || 0) + (bySource.get('DATABASE_ENTITY') || 0);
    const fileCount = bySource.get('FILE') || 0;
    const moduleCount = bySource.get('MODULE') || 0;
    const configCount = bySource.get('CONFIGURATION') || 0;
    const uiCount = bySource.get('UI_COMPONENT') || 0;
    const commandCount = bySource.get('COMMAND') || 0;
    const docCount = bySource.get('DOCUMENTATION') || 0;

    const endpointScore = Math.min(1.0, endpointCount) * (this.config.sourceWeights.ENDPOINT || 0.25);
    const symbolScore = Math.min(1.0, symbolCount) * (this.config.sourceWeights.SYMBOL || 0.20);
    const testScore = Math.min(1.0, testCount) * (this.config.sourceWeights.TEST || 0.15);
    const dependencyScore = Math.min(1.0, dependencyCount) * (this.config.sourceWeights.DEPENDENCY || 0.10);
    const databaseScore = Math.min(1.0, dbCount) * (this.config.sourceWeights.DATABASE || 0.08);
    const fileScore = Math.min(1.0, fileCount) * (this.config.sourceWeights.FILE || 0.06);
    const moduleScore = Math.min(1.0, moduleCount) * (this.config.sourceWeights.MODULE || 0.05);
    const configScore = Math.min(1.0, configCount) * (this.config.sourceWeights.CONFIGURATION || 0.04);
    const uiScore = Math.min(1.0, uiCount) * (this.config.sourceWeights.UI_COMPONENT || 0.03);
    const commandScore = Math.min(1.0, commandCount) * (this.config.sourceWeights.COMMAND || 0.02);
    const docScore = Math.min(1.0, docCount) * (this.config.sourceWeights.DOCUMENTATION || 0.02);

    let rawScore =
      endpointScore +
      symbolScore +
      testScore +
      dependencyScore +
      databaseScore +
      fileScore +
      moduleScore +
      configScore +
      uiScore +
      commandScore +
      docScore;

    // Single source baseline scaling: if candidate has strong evidence (e.g. direct endpoint route = 0.95), ensure high confidence baseline
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
      reasons.push(`Cross-source diversity bonus (+${this.config.diversityBonus}) from ${distinctSources} distinct sources`);
    }

    // Clamp score [0.0, 1.0]
    const finalScore = Math.min(1.0, Math.max(0.0, Math.round(rawScore * 100) / 100));

    if (endpointCount > 0) reasons.push(`API endpoint routes contributed ${endpointScore.toFixed(2)}`);
    if (symbolCount > 0) reasons.push(`Symbols contributed ${symbolScore.toFixed(2)}`);
    if (testCount > 0) reasons.push(`Test suites contributed ${testScore.toFixed(2)}`);
    if (dbCount > 0) reasons.push(`Database entities/repositories contributed ${databaseScore.toFixed(2)}`);
    if (dependencyCount > 0) reasons.push(`External dependencies contributed ${dependencyScore.toFixed(2)}`);

    const level = scoreToMappingConfidenceLevel(finalScore);
    const confidence: MappingConfidence = {
      level,
      score: finalScore,
      reasons,
    };

    const breakdown: MappingScoreBreakdown = {
      endpointScore,
      symbolScore,
      dependencyScore,
      moduleScore,
      fileScore,
      testScore,
      configScore,
      databaseScore,
      uiScore,
      commandScore,
      docScore,
      coherenceScore,
      totalScore: finalScore,
    };

    candidate.score = finalScore;
    candidate.confidence = confidence;

    return { score: finalScore, confidence, breakdown };
  }
}
