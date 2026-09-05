import { randomUUID } from 'crypto';
import type { Feature } from '../../models/Feature';
import type { IFeatureMappingSource, MappingContext } from '../interfaces/IFeatureMappingSource';
import type { MappingCandidate } from '../models/MappingCandidate';
import type { MappingResourceType } from '../models/MappingResourceType';
import { scoreToMappingConfidenceLevel } from '../models/MappingConfidence';
import { MappingMatcher } from './MappingMatcher';

export class FileMappingSource implements IFeatureMappingSource {
  public readonly sourceType: MappingResourceType = 'FILE';
  public readonly name = 'FileMappingSource';

  public getSourceType(): MappingResourceType {
    return this.sourceType;
  }

  public supports(resourceType: MappingResourceType): boolean {
    return resourceType === 'FILE';
  }

  public mapFeature(feature: Feature, context: MappingContext): MappingCandidate[] {
    const candidates: MappingCandidate[] = [];
    const seenFiles = new Set<string>();

    // 1. Files containing matching symbols
    if (context.symbols) {
      for (const sym of context.symbols) {
        if (!sym.filePath || seenFiles.has(sym.filePath)) continue;

        // Skip generic utility files
        if (MappingMatcher.isGenericUtility(sym.name, sym.filePath)) continue;

        const match = MappingMatcher.matchesFeature(feature, sym.name);
        if (match.matches && match.confidence >= 0.6) {
          seenFiles.add(sym.filePath);
          const candidate = this.createFileCandidate(feature, sym.filePath, 'IMPLEMENTATION', match.confidence, [
            {
              evidenceId: `ev_file_sym_${randomUUID().slice(0, 8)}`,
              sourceType: 'FILE',
              sourceId: sym.filePath,
              evidenceType: 'FILE_CONTAINS_FEATURE_SYMBOL',
              description: `File contains feature symbol "${sym.name}": ${match.reason}`,
              strength: 0.85,
              confidence: match.confidence,
              timestamp: Date.now(),
            },
          ]);
          candidates.push(candidate);
        }
      }
    }

    // 2. Files implementing endpoints
    if (context.endpoints) {
      for (const ep of context.endpoints) {
        if (!ep.filePath || seenFiles.has(ep.filePath)) continue;

        const match = MappingMatcher.matchesFeature(feature, ep.path);
        if (match.matches && match.confidence >= 0.6) {
          seenFiles.add(ep.filePath);
          const candidate = this.createFileCandidate(feature, ep.filePath, 'ENTRY_POINT', match.confidence, [
            {
              evidenceId: `ev_file_ep_${randomUUID().slice(0, 8)}`,
              sourceType: 'FILE',
              sourceId: ep.filePath,
              evidenceType: 'FILE_IMPLEMENTS_ENDPOINT',
              description: `File implements endpoint "${ep.method} ${ep.path}" for feature "${feature.name}"`,
              strength: 0.9,
              confidence: match.confidence,
              timestamp: Date.now(),
            },
          ]);
          candidates.push(candidate);
        }
      }
    }

    // 3. Direct filename match (evaluated with care - never folder name == feature alone)
    // If a file is directly referenced in feature.references
    if (feature.references) {
      for (const ref of feature.references) {
        if (ref.resourceType === 'FILE' && !seenFiles.has(ref.resourceId)) {
          seenFiles.add(ref.resourceId);
          const candidate = this.createFileCandidate(
            feature,
            ref.resourceId,
            ref.role || 'IMPLEMENTATION',
            ref.confidence || 0.85,
            [
              {
                evidenceId: `ev_file_ref_${randomUUID().slice(0, 8)}`,
                sourceType: 'FILE',
                sourceId: ref.resourceId,
                evidenceType: 'FEATURE_DIRECT_REFERENCE',
                description: `File directly referenced by feature with role ${ref.role}`,
                strength: 0.95,
                confidence: ref.confidence || 0.85,
                timestamp: Date.now(),
              },
            ]
          );
          candidates.push(candidate);
        }
      }
    }

    return candidates;
  }

  public discoverMappings(context: MappingContext): MappingCandidate[] {
    return [];
  }

  private createFileCandidate(
    feature: Feature,
    filePath: string,
    proposedRole: any,
    confidenceScore: number,
    evidence: any[]
  ): MappingCandidate {
    const level = scoreToMappingConfidenceLevel(confidenceScore);
    return {
      candidateId: `cand_file_${randomUUID().slice(0, 8)}`,
      featureId: feature.id,
      resourceId: filePath,
      resourceType: 'FILE',
      proposedRole,
      evidence,
      score: confidenceScore,
      confidence: {
        level,
        score: confidenceScore,
        reasons: evidence.map((e) => e.description),
      },
      sources: ['FILE'],
      conflicts: [],
      status: 'DETECTED',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }
}
