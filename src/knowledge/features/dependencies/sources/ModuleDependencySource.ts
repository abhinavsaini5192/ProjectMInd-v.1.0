import { randomUUID } from 'crypto';
import type { Feature } from '../../models/Feature';
import type {
  IFeatureRelationshipSource,
  DependencyContext,
} from '../interfaces/IFeatureRelationshipSource';
import type { FeatureRelationshipCandidate } from '../models/FeatureRelationshipCandidate';
import type { FeatureRelationshipType } from '../models/FeatureRelationshipType';
import { scoreToFeatureRelationshipConfidenceLevel } from '../models/FeatureRelationshipConfidence';
import { DependencySourceHelper } from './DependencySourceHelper';

export class ModuleDependencySource implements IFeatureRelationshipSource {
  public readonly sourceType = 'MODULE';
  public readonly name = 'ModuleDependencySource';

  public getSourceType(): string {
    return this.sourceType;
  }

  public supports(relationshipType: FeatureRelationshipType): boolean {
    return relationshipType === 'DEPENDS_ON' || relationshipType === 'COORDINATES';
  }

  public discoverRelationships(
    feature: Feature,
    allFeatures: Feature[],
    context: DependencyContext
  ): FeatureRelationshipCandidate[] {
    const candidates = this.discoverCandidates(allFeatures, context);
    return candidates.filter(
      (c) => c.sourceFeatureId === feature.id || c.targetFeatureId === feature.id
    );
  }

  public discoverCandidates(
    allFeatures: Feature[],
    context: DependencyContext
  ): FeatureRelationshipCandidate[] {
    const candidates: FeatureRelationshipCandidate[] = [];
    if (!context.modules || context.modules.length === 0) {
      return candidates;
    }

    const resourceMap = DependencySourceHelper.buildResourceToFeaturesMap(allFeatures, context);
    const seenPairs = new Set<string>();

    for (const mod of context.modules) {
      const modFeatures = [
        ...DependencySourceHelper.getFeaturesForResource(mod.id, resourceMap),
        ...DependencySourceHelper.getFeaturesForResource(mod.path, resourceMap),
        ...DependencySourceHelper.getFeaturesForResource(mod.name, resourceMap),
      ];
      const uniqueModFeatures = Array.from(new Set(modFeatures));

      const importedModules: string[] = (mod as any).dependencies || (mod as any).imports || [];
      for (const imported of importedModules) {
        const importedFeatures = DependencySourceHelper.getFeaturesForResource(imported, resourceMap);
        for (const srcFeatId of uniqueModFeatures) {
          for (const tgtFeatId of importedFeatures) {
            if (srcFeatId === tgtFeatId) continue;

            const pairKey = `${srcFeatId}:::${tgtFeatId}:::MODULE`;
            if (seenPairs.has(pairKey)) continue;
            seenPairs.add(pairKey);

            const candidate: FeatureRelationshipCandidate = {
              candidateId: `cand_mod_${randomUUID().slice(0, 8)}`,
              sourceFeatureId: srcFeatId,
              targetFeatureId: tgtFeatId,
              proposedType: 'DEPENDS_ON',
              direction: 'DIRECTED',
              evidence: [
                {
                  evidenceId: `ev_mod_${randomUUID().slice(0, 8)}`,
                  sourceType: 'MODULE',
                  sourceId: `${mod.path} -> ${imported}`,
                  evidenceType: 'MODULE_LEVEL_DEPENDENCY',
                  description: `Module "${mod.name}" in feature "${srcFeatId}" imports/depends on module "${imported}" in feature "${tgtFeatId}"`,
                  strength: 0.65,
                  confidence: 0.65,
                  metadata: {
                    sourceModule: mod.name,
                    importedModule: imported,
                  },
                  timestamp: Date.now(),
                },
              ],
              score: 0.65,
              confidence: {
                level: scoreToFeatureRelationshipConfidenceLevel(0.65),
                score: 0.65,
                reasons: [`Module-level import dependency (${mod.name} -> ${imported})`],
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
      }
    }

    return candidates;
  }
}
