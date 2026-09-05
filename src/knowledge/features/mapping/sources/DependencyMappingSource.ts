import { randomUUID } from 'crypto';
import type { Feature } from '../../models/Feature';
import type { IFeatureMappingSource, MappingContext } from '../interfaces/IFeatureMappingSource';
import type { MappingCandidate } from '../models/MappingCandidate';
import type { MappingResourceType } from '../models/MappingResourceType';
import { scoreToMappingConfidenceLevel } from '../models/MappingConfidence';
import { MappingMatcher } from './MappingMatcher';

export class DependencyMappingSource implements IFeatureMappingSource {
  public readonly sourceType: MappingResourceType = 'DEPENDENCY';
  public readonly name = 'DependencyMappingSource';

  private static readonly GENERIC_LIBRARIES = new Set([
    'lodash',
    'date-fns',
    'moment',
    'chalk',
    'winston',
    'debug',
    'axios',
    'express',
    'react',
    'react-dom',
    'tslib',
    'dotenv',
    'typescript',
    'vitest',
    'jest',
  ]);

  public getSourceType(): MappingResourceType {
    return this.sourceType;
  }

  public supports(resourceType: MappingResourceType): boolean {
    return resourceType === 'DEPENDENCY';
  }

  public mapFeature(feature: Feature, context: MappingContext): MappingCandidate[] {
    const candidates: MappingCandidate[] = [];
    if (!context.dependencies) return candidates;

    for (const dep of context.dependencies) {
      const target = dep.targetId || (dep as any).target;
      const source = dep.sourceId || (dep as any).source;
      if (!target) continue;

      const targetClean = target.toLowerCase().trim();
      // Filter out pure generic utilities
      if (DependencyMappingSource.GENERIC_LIBRARIES.has(targetClean)) {
        continue;
      }

      const match = MappingMatcher.matchesFeature(feature, target);
      if (match.matches) {
        const role = targetClean.includes('stripe') || targetClean.includes('paypal') ? 'INTEGRATION' : 'DEPENDENCY';
        const candidate: MappingCandidate = {
          candidateId: `cand_dep_${randomUUID().slice(0, 8)}`,
          featureId: feature.id,
          resourceId: target,
          resourceType: 'DEPENDENCY',
          proposedRole: role,
          evidence: [
            {
              evidenceId: `ev_dep_${randomUUID().slice(0, 8)}`,
              sourceType: 'DEPENDENCY',
              sourceId: target,
              evidenceType: 'FEATURE_DEPENDENCY',
              description: `External dependency "${target}" imported by ${source || 'project'} provides ${feature.name} capability`,
              strength: 0.8,
              confidence: match.confidence,
              metadata: {
                targetId: target,
                sourceId: source,
                type: dep.type,
              },
              timestamp: Date.now(),
            },
          ],
          score: match.confidence,
          confidence: {
            level: scoreToMappingConfidenceLevel(match.confidence),
            score: match.confidence,
            reasons: [match.reason],
          },
          sources: ['DEPENDENCY'],
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
