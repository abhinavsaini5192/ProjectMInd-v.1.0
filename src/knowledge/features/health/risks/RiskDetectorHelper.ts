import { SecuritySanitizer } from '../../../../intelligence/agent/hardening/SecuritySanitizer.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { FeatureRiskType } from '../models/FeatureRiskType.js';
import type { FeatureRiskSeverity } from '../models/FeatureRiskSeverity.js';
import type { FeatureRiskEvidence } from '../models/FeatureRiskEvidence.js';

export class RiskDetectorHelper {
  public static createRisk(params: {
    featureId: string;
    riskType: FeatureRiskType;
    severity: FeatureRiskSeverity;
    score: number; // 0 to 100
    confidence: number; // 0 to 1
    description: string;
    evidence: FeatureRiskEvidence[];
    contributingSignals: string[];
    affectedResources?: string[];
    knowledgeVersion?: string;
  }): FeatureRisk {
    const sanitizedDesc = SecuritySanitizer.redactSecrets(params.description);
    const riskId = `risk_${params.featureId}_${params.riskType}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      riskId,
      featureId: params.featureId,
      riskType: params.riskType,
      severity: params.severity,
      score: Math.max(0, Math.min(100, Math.round(params.score))),
      confidence: Math.max(0, Math.min(1, params.confidence)),
      description: sanitizedDesc,
      evidence: params.evidence,
      contributingSignals: Array.from(new Set(params.contributingSignals)),
      affectedResources: Array.from(new Set(params.affectedResources || [])),
      detectedAt: Date.now(),
      knowledgeVersion: params.knowledgeVersion || '6.6.0',
      active: true
    };
  }

  public static getSeverityRank(severity: FeatureRiskSeverity): number {
    switch (severity) {
      case 'CRITICAL':
        return 5;
      case 'HIGH':
        return 4;
      case 'MEDIUM':
        return 3;
      case 'LOW':
        return 2;
      case 'INFO':
      default:
        return 1;
    }
  }

  public static deduplicateRisks(risks: FeatureRisk[]): FeatureRisk[] {
    const grouped = new Map<string, FeatureRisk[]>();

    for (const risk of risks) {
      const key = `${risk.featureId}::${risk.riskType}`;
      const existing = grouped.get(key) || [];
      existing.push(risk);
      grouped.set(key, existing);
    }

    const deduplicated: FeatureRisk[] = [];

    for (const [, group] of grouped) {
      if (group.length === 1) {
        deduplicated.push(group[0]);
        continue;
      }

      // Merge multiple risks of same type for the same feature
      let highestSeverity = group[0].severity;
      let maxScore = group[0].score;
      let maxConfidence = group[0].confidence;
      const allSignals: string[] = [];
      const allResources: string[] = [];
      const allEvidence: FeatureRiskEvidence[] = [];
      const descriptions: string[] = [];

      for (const r of group) {
        if (this.getSeverityRank(r.severity) > this.getSeverityRank(highestSeverity)) {
          highestSeverity = r.severity;
        }
        if (r.score > maxScore) maxScore = r.score;
        if (r.confidence > maxConfidence) maxConfidence = r.confidence;
        allSignals.push(...r.contributingSignals);
        allResources.push(...r.affectedResources);
        allEvidence.push(...r.evidence);
        descriptions.push(r.description);
      }

      const mergedRisk: FeatureRisk = {
        riskId: group[0].riskId,
        featureId: group[0].featureId,
        riskType: group[0].riskType,
        severity: highestSeverity,
        score: maxScore,
        confidence: maxConfidence,
        description: descriptions.join(' | '),
        evidence: allEvidence,
        contributingSignals: Array.from(new Set(allSignals)),
        affectedResources: Array.from(new Set(allResources)),
        detectedAt: Math.min(...group.map((g) => g.detectedAt)),
        knowledgeVersion: group[0].knowledgeVersion,
        active: true
      };

      deduplicated.push(mergedRisk);
    }

    return deduplicated;
  }
}
