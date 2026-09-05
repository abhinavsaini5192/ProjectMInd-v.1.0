import { randomUUID } from 'crypto';
import type { Feature } from '../../models/Feature';
import type { IFeatureMappingSource, MappingContext } from '../interfaces/IFeatureMappingSource';
import type { MappingCandidate } from '../models/MappingCandidate';
import type { MappingResourceType } from '../models/MappingResourceType';
import type { MappingRole } from '../models/MappingRole';
import { scoreToMappingConfidenceLevel } from '../models/MappingConfidence';
import { MappingMatcher } from './MappingMatcher';

export class SymbolMappingSource implements IFeatureMappingSource {
  public readonly sourceType: MappingResourceType = 'SYMBOL';
  public readonly name = 'SymbolMappingSource';

  public getSourceType(): MappingResourceType {
    return this.sourceType;
  }

  public supports(resourceType: MappingResourceType): boolean {
    return resourceType === 'SYMBOL';
  }

  public mapFeature(feature: Feature, context: MappingContext): MappingCandidate[] {
    const candidates: MappingCandidate[] = [];
    if (!context.symbols) return candidates;

    for (const sym of context.symbols) {
      if (MappingMatcher.isGenericUtility(sym.name, sym.filePath)) {
        continue;
      }

      const match = MappingMatcher.matchesFeature(feature, sym.name);
      if (match.matches) {
        const role = this.inferSymbolRole(sym.name, sym.kind);
        const candidate: MappingCandidate = {
          candidateId: `cand_sym_${randomUUID().slice(0, 8)}`,
          featureId: feature.id,
          resourceId: sym.id || sym.name,
          resourceType: 'SYMBOL',
          proposedRole: role,
          evidence: [
            {
              evidenceId: `ev_sym_${randomUUID().slice(0, 8)}`,
              sourceType: 'SYMBOL',
              sourceId: sym.id || sym.name,
              evidenceType: 'SYMBOL_FEATURE_ALIGNMENT',
              description: `Symbol "${sym.name}" (${sym.kind || 'declaration'}) in ${sym.filePath}: ${match.reason}`,
              strength: 0.9,
              confidence: match.confidence,
              metadata: {
                name: sym.name,
                kind: sym.kind,
                filePath: sym.filePath,
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
          sources: ['SYMBOL'],
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

  private inferSymbolRole(name: string, kind?: string): MappingRole {
    const lower = name.toLowerCase();
    if (lower.includes('controller') || lower.includes('handler') || lower.includes('route')) {
      return 'API';
    }
    if (lower.includes('repository') || lower.includes('store') || lower.includes('dao') || lower.includes('entity')) {
      return 'STORAGE';
    }
    if (lower.includes('service') || lower.includes('processor') || lower.includes('engine') || lower.includes('manager')) {
      return 'IMPLEMENTATION';
    }
    if (lower.includes('config') || lower.includes('settings')) {
      return 'CONFIGURATION';
    }
    return 'SUPPORT';
  }
}
