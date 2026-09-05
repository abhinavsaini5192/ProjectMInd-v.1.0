import { randomUUID } from 'crypto';
import type { Feature } from '../../models/Feature';
import type { IFeatureMappingSource, MappingContext } from '../interfaces/IFeatureMappingSource';
import type { MappingCandidate } from '../models/MappingCandidate';
import type { MappingResourceType } from '../models/MappingResourceType';
import { scoreToMappingConfidenceLevel } from '../models/MappingConfidence';
import { MappingMatcher } from './MappingMatcher';

export class EndpointMappingSource implements IFeatureMappingSource {
  public readonly sourceType: MappingResourceType = 'ENDPOINT';
  public readonly name = 'EndpointMappingSource';

  public getSourceType(): MappingResourceType {
    return this.sourceType;
  }

  public supports(resourceType: MappingResourceType): boolean {
    return resourceType === 'ENDPOINT';
  }

  public mapFeature(feature: Feature, context: MappingContext): MappingCandidate[] {
    const candidates: MappingCandidate[] = [];
    if (!context.endpoints) return candidates;

    for (const ep of context.endpoints) {
      const endpointId = `${ep.method} ${ep.path}`;
      const match = MappingMatcher.matchesFeature(feature, ep.path);

      if (match.matches) {
        // Endpoints have very high confidence when path clearly maps to feature
        const score = Math.max(0.92, match.confidence);
        const candidate: MappingCandidate = {
          candidateId: `cand_ep_${randomUUID().slice(0, 8)}`,
          featureId: feature.id,
          resourceId: endpointId,
          resourceType: 'ENDPOINT',
          proposedRole: 'ENTRY_POINT',
          evidence: [
            {
              evidenceId: `ev_ep_${randomUUID().slice(0, 8)}`,
              sourceType: 'ENDPOINT',
              sourceId: endpointId,
              evidenceType: 'API_ENTRYPOINT',
              description: `API route "${endpointId}" acts as primary entry point for feature "${feature.name}"`,
              strength: 0.95,
              confidence: score,
              metadata: {
                method: ep.method,
                path: ep.path,
                handlerSymbolId: ep.handlerSymbolId,
                filePath: ep.filePath,
              },
              timestamp: Date.now(),
            },
          ],
          score,
          confidence: {
            level: scoreToMappingConfidenceLevel(score),
            score,
            reasons: [`Direct API route ${endpointId} exposed for feature`],
          },
          sources: ['ENDPOINT'],
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
