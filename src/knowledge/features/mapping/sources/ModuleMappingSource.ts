import { randomUUID } from 'crypto';
import type { Feature } from '../../models/Feature';
import type { IFeatureMappingSource, MappingContext } from '../interfaces/IFeatureMappingSource';
import type { MappingCandidate } from '../models/MappingCandidate';
import type { MappingResourceType } from '../models/MappingResourceType';
import { scoreToMappingConfidenceLevel } from '../models/MappingConfidence';
import { MappingMatcher } from './MappingMatcher';

export class ModuleMappingSource implements IFeatureMappingSource {
  public readonly sourceType: MappingResourceType = 'MODULE';
  public readonly name = 'ModuleMappingSource';

  public getSourceType(): MappingResourceType {
    return this.sourceType;
  }

  public supports(resourceType: MappingResourceType): boolean {
    return resourceType === 'MODULE';
  }

  public mapFeature(feature: Feature, context: MappingContext): MappingCandidate[] {
    const candidates: MappingCandidate[] = [];
    if (!context.modules) return candidates;

    for (const mod of context.modules) {
      // 1. Direct path / name match
      const pathMatch = MappingMatcher.matchesFeature(feature, mod.name || mod.path);
      // 2. Export alignment
      let exportMatches = 0;
      if (mod.exports) {
        for (const exp of mod.exports) {
          if (MappingMatcher.matchesFeature(feature, exp).matches) {
            exportMatches++;
          }
        }
      }

      if (pathMatch.matches || exportMatches > 0) {
        const score = Math.min(1.0, (pathMatch.matches ? pathMatch.confidence : 0.6) + exportMatches * 0.1);
        const candidate: MappingCandidate = {
          candidateId: `cand_mod_${randomUUID().slice(0, 8)}`,
          featureId: feature.id,
          resourceId: mod.id || mod.path,
          resourceType: 'MODULE',
          proposedRole: 'ORCHESTRATION',
          evidence: [
            {
              evidenceId: `ev_mod_${randomUUID().slice(0, 8)}`,
              sourceType: 'MODULE',
              sourceId: mod.id || mod.path,
              evidenceType: 'MODULE_COHERENCE',
              description: `Module "${mod.name}" (${mod.path}) has ${exportMatches} exports aligned with feature "${feature.name}"`,
              strength: 0.8,
              confidence: score,
              metadata: {
                name: mod.name,
                path: mod.path,
                exports: mod.exports,
              },
              timestamp: Date.now(),
            },
          ],
          score,
          confidence: {
            level: scoreToMappingConfidenceLevel(score),
            score,
            reasons: [`Module container aligns with feature capability with ${exportMatches} exports`],
          },
          sources: ['MODULE'],
          conflicts: [],
          status: 'DETECTED',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        candidates.push(candidate);
      }
    }

    return candidates;
  }

  public discoverMappings(context: MappingContext): MappingCandidate[] {
    return [];
  }
}
