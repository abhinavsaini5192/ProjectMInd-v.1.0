import { randomUUID } from 'crypto';
import type { Feature } from '../../models/Feature';
import type { IFeatureMappingSource, MappingContext } from '../interfaces/IFeatureMappingSource';
import type { MappingCandidate } from '../models/MappingCandidate';
import type { MappingResourceType } from '../models/MappingResourceType';
import { scoreToMappingConfidenceLevel } from '../models/MappingConfidence';
import { MappingMatcher } from './MappingMatcher';
import { SecuritySanitizer } from '../../../../intelligence/agent/hardening/SecuritySanitizer';

export class ConfigurationMappingSource implements IFeatureMappingSource {
  public readonly sourceType: MappingResourceType = 'CONFIGURATION';
  public readonly name = 'ConfigurationMappingSource';

  public getSourceType(): MappingResourceType {
    return this.sourceType;
  }

  public supports(resourceType: MappingResourceType): boolean {
    return resourceType === 'CONFIGURATION';
  }

  public mapFeature(feature: Feature, context: MappingContext): MappingCandidate[] {
    const candidates: MappingCandidate[] = [];
    if (!context.configurations) return candidates;

    for (const cfg of context.configurations) {
      // NEVER store or expose actual secret values.
      const safeKey = SecuritySanitizer.redactSecrets(cfg.key);
      const match = MappingMatcher.matchesFeature(feature, safeKey);

      if (match.matches) {
        const candidate: MappingCandidate = {
          candidateId: `cand_cfg_${randomUUID().slice(0, 8)}`,
          featureId: feature.id,
          resourceId: safeKey,
          resourceType: 'CONFIGURATION',
          proposedRole: 'CONFIGURATION',
          evidence: [
            {
              evidenceId: `ev_cfg_${randomUUID().slice(0, 8)}`,
              sourceType: 'CONFIGURATION',
              sourceId: safeKey,
              evidenceType: 'FEATURE_CONFIGURATION_KEY',
              description: `Configuration key "${safeKey}" configures feature "${feature.name}" in ${cfg.filePath || 'environment'}`,
              strength: 0.75,
              confidence: match.confidence,
              metadata: {
                key: safeKey,
                category: cfg.category,
                filePath: cfg.filePath,
                // Do NOT copy raw secret value
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
          sources: ['CONFIGURATION'],
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
