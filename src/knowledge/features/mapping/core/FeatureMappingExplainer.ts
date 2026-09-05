import type { FeatureResourceMapping } from '../models/FeatureResourceMapping';
import type { MappingConflict } from '../models/MappingConflict';

export interface MappingExplanation {
  mappingId: string;
  featureId: string;
  resourceId: string;
  resourceType: string;
  role: string;
  confidence: {
    level: string;
    score: number;
    reasons: string[];
  };
  score: number;
  source: string;
  evidenceCount: number;
  evidenceSummary: string[];
  conflicts: MappingConflict[];
  knowledgeVersion: string;
  mappingVersion: number;
  active: boolean;
  reasoningSummary: string;
}

export class FeatureMappingExplainer {
  public explain(mapping: FeatureResourceMapping, conflicts: MappingConflict[] = []): MappingExplanation {
    const evidenceSummary = (mapping.evidence || []).map((e) => e.description);
    const relatedConflicts = conflicts.filter(
      (c) => c.resourceId === mapping.resourceId && c.featureId === mapping.featureId
    );

    const reasoningSummary =
      evidenceSummary.length > 0
        ? `Resource "${mapping.resourceId}" is mapped to feature "${mapping.featureId}" as ${mapping.role} based on ${evidenceSummary.length} evidence signals (${evidenceSummary[0]}). Confidence: ${mapping.confidence.level} (${mapping.score}).`
        : `Resource "${mapping.resourceId}" was mapped via ${mapping.source} configuration with role ${mapping.role}.`;

    return {
      mappingId: mapping.mappingId,
      featureId: mapping.featureId,
      resourceId: mapping.resourceId,
      resourceType: mapping.resourceType,
      role: mapping.role,
      confidence: {
        level: mapping.confidence.level,
        score: mapping.confidence.score,
        reasons: mapping.confidence.reasons,
      },
      score: mapping.score,
      source: mapping.source,
      evidenceCount: (mapping.evidence || []).length,
      evidenceSummary,
      conflicts: relatedConflicts,
      knowledgeVersion: mapping.knowledgeVersion,
      mappingVersion: mapping.mappingVersion,
      active: mapping.active,
      reasoningSummary,
    };
  }
}
