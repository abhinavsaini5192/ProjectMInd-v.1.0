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
import { SecuritySanitizer } from '../../../../intelligence/agent/hardening/SecuritySanitizer';

export class ConfigurationDependencySource implements IFeatureRelationshipSource {
  public readonly sourceType = 'CONFIGURATION';
  public readonly name = 'ConfigurationDependencySource';

  public getSourceType(): string {
    return this.sourceType;
  }

  public supports(relationshipType: FeatureRelationshipType): boolean {
    return relationshipType === 'INTEGRATES_WITH' || relationshipType === 'ASSOCIATED_WITH';
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
    if (!context.configurations || context.configurations.length === 0) {
      return candidates;
    }

    const configItems: Array<{ key: string; value?: string; filePath?: string; category?: string }> = [];
    for (const cfg of context.configurations) {
      if (cfg.key) {
        configItems.push({
          key: cfg.key,
          value: (cfg as any).value || cfg.valueMasked,
          filePath: cfg.filePath,
          category: cfg.category,
        });
      }
      if (Array.isArray((cfg as any).keys)) {
        for (const k of (cfg as any).keys) {
          if (typeof k === 'string') {
            configItems.push({ key: k, filePath: cfg.filePath, category: cfg.category });
          } else if (k && typeof k.key === 'string') {
            configItems.push({ key: k.key, value: k.value, filePath: cfg.filePath, category: cfg.category });
          }
        }
      }
    }

    const resourceMap = DependencySourceHelper.buildResourceToFeaturesMap(allFeatures, context);
    const seenPairs = new Set<string>();

    for (const item of configItems) {
      const rawKey = item.key || '';
      const safeKey = SecuritySanitizer.redactSecrets(rawKey);
      const safeVal = item.value ? SecuritySanitizer.redactSecrets(item.value) : undefined;
      const lowerKey = safeKey.toLowerCase();
      const hasSecret = safeVal !== undefined || /secret|token|password|key/i.test(safeKey);
      const valSnippet = hasSecret ? ' [REDACTED]' : '';

      // 1. Config file is owned by Feature A and key references Feature B
      const fileOwners = item.filePath
        ? DependencySourceHelper.getFeaturesForResource(item.filePath, resourceMap)
        : [];

      for (const ownerId of fileOwners) {
        const featA = allFeatures.find((f) => f.id === ownerId);
        if (!featA) continue;

        for (const featB of allFeatures) {
          if (featB.id === ownerId) continue;

          const tokenB = featB.name.toLowerCase().split(/\s+/)[0] || '';
          const idB = featB.id.toLowerCase().replace('feat_', '');

          const matchesB =
            (tokenB.length > 2 && lowerKey.includes(tokenB)) ||
            (idB.length > 2 && lowerKey.includes(idB)) ||
            (tokenB.length > 4 && lowerKey.includes(tokenB.slice(0, 4)));

          if (matchesB) {
            const pairKey = `${featA.id}:::${featB.id}:::${safeKey}`;
            if (seenPairs.has(pairKey)) continue;
            seenPairs.add(pairKey);

            candidates.push({
              candidateId: `cand_cfg_${randomUUID().slice(0, 8)}`,
              sourceFeatureId: featA.id,
              targetFeatureId: featB.id,
              proposedType: 'INTEGRATES_WITH',
              direction: 'DIRECTED',
              evidence: [
                {
                  evidenceId: `ev_cfg_${randomUUID().slice(0, 8)}`,
                  sourceType: 'CONFIGURATION',
                  sourceId: safeKey,
                  evidenceType: 'CONFIGURATION_CROSS_FEATURE_KEY',
                  description: `Configuration key "${safeKey}" configures cross-feature integration between "${featA.name}" and "${featB.name}"${valSnippet}`,
                  strength: 0.50,
                  confidence: 0.50,
                  metadata: {
                    configKey: safeKey,
                    category: item.category,
                    filePath: item.filePath,
                  },
                  timestamp: Date.now(),
                },
              ],
              score: 0.50,
              confidence: {
                level: scoreToFeatureRelationshipConfidenceLevel(0.50),
                score: 0.50,
                reasons: [`Configuration setting ${safeKey} in ${featA.name} references ${featB.name}`],
              },
              sources: ['CONFIGURATION'],
              conflicts: [],
              status: 'DETECTED',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          }
        }
      }

      // 2. Global compound keys referencing both features
      for (let i = 0; i < allFeatures.length; i++) {
        for (let j = i + 1; j < allFeatures.length; j++) {
          const featA = allFeatures[i]!;
          const featB = allFeatures[j]!;

          const tokenA = featA.name.toLowerCase().split(/\s+/)[0] || '';
          const tokenB = featB.name.toLowerCase().split(/\s+/)[0] || '';
          const idA = featA.id.toLowerCase().replace('feat_', '');
          const idB = featB.id.toLowerCase().replace('feat_', '');

          const matchesA =
            (tokenA.length > 2 && lowerKey.includes(tokenA)) ||
            (idA.length > 2 && lowerKey.includes(idA)) ||
            (tokenA.length > 4 && lowerKey.includes(tokenA.slice(0, 4)));

          const matchesB =
            (tokenB.length > 2 && lowerKey.includes(tokenB)) ||
            (idB.length > 2 && lowerKey.includes(idB)) ||
            (tokenB.length > 4 && lowerKey.includes(tokenB.slice(0, 4)));

          if (matchesA && matchesB) {
            const pairKey = `${featA.id}:::${featB.id}:::${safeKey}`;
            if (seenPairs.has(pairKey)) continue;
            seenPairs.add(pairKey);

            const candidate: FeatureRelationshipCandidate = {
              candidateId: `cand_cfg_${randomUUID().slice(0, 8)}`,
              sourceFeatureId: featA.id,
              targetFeatureId: featB.id,
              proposedType: 'INTEGRATES_WITH',
              direction: 'UNDIRECTED',
              evidence: [
                {
                  evidenceId: `ev_cfg_${randomUUID().slice(0, 8)}`,
                  sourceType: 'CONFIGURATION',
                  sourceId: safeKey,
                  evidenceType: 'CONFIGURATION_CROSS_FEATURE_KEY',
                  description: `Configuration key "${safeKey}" configures cross-feature integration between "${featA.name}" and "${featB.name}"${valSnippet}`,
                  strength: 0.50,
                  confidence: 0.50,
                  metadata: {
                    configKey: safeKey,
                    category: item.category,
                    filePath: item.filePath,
                  },
                  timestamp: Date.now(),
                },
              ],
              score: 0.50,
              confidence: {
                level: scoreToFeatureRelationshipConfidenceLevel(0.50),
                score: 0.50,
                reasons: [`Cross-feature configuration setting ${safeKey}`],
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
      }
    }

    return candidates;
  }
}
