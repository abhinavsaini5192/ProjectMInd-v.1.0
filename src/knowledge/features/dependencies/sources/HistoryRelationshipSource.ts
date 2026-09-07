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

export class HistoryRelationshipSource implements IFeatureRelationshipSource {
  public readonly sourceType = 'HISTORY';
  public readonly name = 'HistoryRelationshipSource';

  public getSourceType(): string {
    return this.sourceType;
  }

  public supports(relationshipType: FeatureRelationshipType): boolean {
    return relationshipType === 'ASSOCIATED_WITH';
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
    if (!context.history || context.history.length === 0) {
      return candidates;
    }

    const resourceMap = DependencySourceHelper.buildResourceToFeaturesMap(allFeatures, context);
    const coChangeCounts = new Map<string, number>();

    for (const commit of context.history) {
      const changedFiles = commit.changedFiles || [];
      const commitFeatures = new Set<string>();

      for (const file of changedFiles) {
        const feats = DependencySourceHelper.getFeaturesForResource(file, resourceMap);
        for (const fId of feats) {
          commitFeatures.add(fId);
        }
      }

      if (commitFeatures.size < 2) continue;

      const featList = Array.from(commitFeatures);
      for (let i = 0; i < featList.length; i++) {
        for (let j = i + 1; j < featList.length; j++) {
          const [f1, f2] = featList[i]! < featList[j]! ? [featList[i]!, featList[j]!] : [featList[j]!, featList[i]!];
          const pair = `${f1}:::${f2}`;
          coChangeCounts.set(pair, (coChangeCounts.get(pair) || 0) + 1);
        }
      }
    }

    for (const [pair, count] of coChangeCounts.entries()) {
      if (count < 1) continue;

      const [featA, featB] = pair.split(':::') as [string, string];
      // History is strictly LOW confidence (0.35)
      const score = Math.min(0.40, 0.30 + count * 0.05);

      const candidate: FeatureRelationshipCandidate = {
        candidateId: `cand_hist_${randomUUID().slice(0, 8)}`,
        sourceFeatureId: featA,
        targetFeatureId: featB,
        proposedType: 'ASSOCIATED_WITH',
        direction: 'UNDIRECTED',
        evidence: [
          {
            evidenceId: `ev_hist_${randomUUID().slice(0, 8)}`,
            sourceType: 'HISTORY',
            sourceId: `co-change:${featA}:${featB}`,
            evidenceType: 'HISTORICAL_CO_CHANGE',
            description: `Features "${featA}" and "${featB}" have repeatedly changed together in ${count} commits`,
            strength: 0.35,
            confidence: score,
            metadata: {
              coChangeCount: count,
            },
            timestamp: Date.now(),
          },
        ],
        score,
        confidence: {
          level: scoreToFeatureRelationshipConfidenceLevel(score),
          score,
          reasons: [`Co-change history indicates coupling (${count} shared commits)`],
        },
        sources: ['HISTORY'],
        conflicts: [],
        status: 'DETECTED',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      candidates.push(candidate);
    }

    return candidates;
  }
}
