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

export class EndpointInteractionSource implements IFeatureRelationshipSource {
  public readonly sourceType = 'ENDPOINT';
  public readonly name = 'EndpointInteractionSource';

  public getSourceType(): string {
    return this.sourceType;
  }

  public supports(relationshipType: FeatureRelationshipType): boolean {
    return (
      relationshipType === 'DEPENDS_ON' ||
      relationshipType === 'CONSUMES' ||
      relationshipType === 'AUTHORIZES' ||
      relationshipType === 'INTEGRATES_WITH'
    );
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
    if (!context.endpoints || context.endpoints.length === 0) {
      return candidates;
    }

    const resourceMap = DependencySourceHelper.buildResourceToFeaturesMap(allFeatures, context);
    const seenPairs = new Set<string>();

    for (const ep of context.endpoints) {
      const endpointId = `${ep.method} ${ep.path}`;
      const epFeatures = [
        ...DependencySourceHelper.getFeaturesForResource(endpointId, resourceMap),
        ...(ep.filePath ? DependencySourceHelper.getFeaturesForResource(ep.filePath, resourceMap) : []),
        ...(ep.handlerSymbolId ? DependencySourceHelper.getFeaturesForResource(ep.handlerSymbolId, resourceMap) : []),
      ];

      // Deduplicate features owning this endpoint
      const uniqueEpFeatures = Array.from(new Set(epFeatures));

      // 1. Check for middleware / authorization dependencies (e.g. AuthMiddleware)
      const middlewareList: string[] = (ep as any).middleware || [];
      if ((ep as any).protectedBy) {
        middlewareList.push((ep as any).protectedBy);
      }
      if ((ep as any).authRequired) {
        middlewareList.push('auth');
      }

      for (const mw of middlewareList) {
        const mwFeatures = DependencySourceHelper.getFeaturesForResource(mw, resourceMap);
        // Fallback: if mw is 'AuthMiddleware' or contains 'auth', look for Authentication feature
        if (mwFeatures.length === 0 && mw.toLowerCase().includes('auth')) {
          const authFeat = allFeatures.find((f) => f.name.toLowerCase().includes('auth'));
          if (authFeat) mwFeatures.push(authFeat.id);
        }

        for (const epFeatId of uniqueEpFeatures) {
          for (const mwFeatId of mwFeatures) {
            if (epFeatId === mwFeatId) continue;

            const pairKey = `${epFeatId}:::${mwFeatId}:::DEPENDS_ON:::AUTH_MIDDLEWARE`;
            if (seenPairs.has(pairKey)) continue;
            seenPairs.add(pairKey);

            const candidate: FeatureRelationshipCandidate = {
              candidateId: `cand_ep_auth_${randomUUID().slice(0, 8)}`,
              sourceFeatureId: epFeatId,
              targetFeatureId: mwFeatId,
              proposedType: 'DEPENDS_ON',
              direction: 'DIRECTED',
              evidence: [
                {
                  evidenceId: `ev_ep_mw_${randomUUID().slice(0, 8)}`,
                  sourceType: 'ENDPOINT',
                  sourceId: endpointId,
                  evidenceType: 'ENDPOINT_SECURITY_MIDDLEWARE',
                  description: `Endpoint "${endpointId}" in feature "${epFeatId}" is protected by middleware "${mw}" provided by feature "${mwFeatId}"`,
                  strength: 0.95,
                  confidence: 0.95,
                  metadata: {
                    endpoint: endpointId,
                    middleware: mw,
                    filePath: ep.filePath,
                  },
                  timestamp: Date.now(),
                },
              ],
              score: 0.95,
              confidence: {
                level: scoreToFeatureRelationshipConfidenceLevel(0.95),
                score: 0.95,
                reasons: [`Endpoint ${endpointId} requires security/auth middleware (${mw})`],
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
      }

      // 2. Check for callers of this endpoint from other features
      const callers: string[] = (ep as any).callers || (ep as any).invokedBy || [];
      for (const caller of callers) {
        const callerFeatures = DependencySourceHelper.getFeaturesForResource(caller, resourceMap);
        for (const callerFeatId of callerFeatures) {
          for (const epFeatId of uniqueEpFeatures) {
            if (callerFeatId === epFeatId) continue;

            const pairKey = `${callerFeatId}:::${epFeatId}:::CONSUMES:::ENDPOINT`;
            if (seenPairs.has(pairKey)) continue;
            seenPairs.add(pairKey);

            const candidate: FeatureRelationshipCandidate = {
              candidateId: `cand_ep_call_${randomUUID().slice(0, 8)}`,
              sourceFeatureId: callerFeatId,
              targetFeatureId: epFeatId,
              proposedType: 'CONSUMES',
              direction: 'DIRECTED',
              evidence: [
                {
                  evidenceId: `ev_ep_call_${randomUUID().slice(0, 8)}`,
                  sourceType: 'ENDPOINT',
                  sourceId: `${caller} -> ${endpointId}`,
                  evidenceType: 'ENDPOINT_API_INVOCATION',
                  description: `Caller "${caller}" in feature "${callerFeatId}" invokes endpoint "${endpointId}" in feature "${epFeatId}"`,
                  strength: 0.92,
                  confidence: 0.92,
                  metadata: {
                    caller,
                    endpoint: endpointId,
                  },
                  timestamp: Date.now(),
                },
              ],
              score: 0.92,
              confidence: {
                level: scoreToFeatureRelationshipConfidenceLevel(0.92),
                score: 0.92,
                reasons: [`Feature ${callerFeatId} consumes API endpoint ${endpointId} of ${epFeatId}`],
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
      }
    }

    return candidates;
  }
}
