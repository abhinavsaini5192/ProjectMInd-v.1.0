import { randomUUID } from 'crypto';
import type { Feature } from '../../models/Feature';
import type { IFeatureMappingSource, MappingContext } from '../interfaces/IFeatureMappingSource';
import type { MappingCandidate } from '../models/MappingCandidate';
import type { MappingResourceType } from '../models/MappingResourceType';
import type { MappingRole } from '../models/MappingRole';
import { scoreToMappingConfidenceLevel } from '../models/MappingConfidence';
import { MappingMatcher } from './MappingMatcher';

export class DatabaseMappingSource implements IFeatureMappingSource {
  public readonly sourceType: MappingResourceType = 'DATABASE';
  public readonly name = 'DatabaseMappingSource';

  public getSourceType(): MappingResourceType {
    return this.sourceType;
  }

  public supports(resourceType: MappingResourceType): boolean {
    return resourceType === 'DATABASE' || resourceType === 'DATABASE_ENTITY';
  }

  public mapFeature(feature: Feature, context: MappingContext): MappingCandidate[] {
    const candidates: MappingCandidate[] = [];
    const seenEntities = new Set<string>();

    // 1. Explicit database entities in context
    if (context.databaseEntities) {
      for (const entity of context.databaseEntities) {
        const match = MappingMatcher.matchesFeature(feature, entity.name);
        // Shared entity check (e.g. User belongs to Authentication as DEPENDENCY/STORAGE and User Management as IMPLEMENTATION)
        const isUserRelated = entity.name.toLowerCase().includes('user');
        const isFeatureAuth = feature.name.toLowerCase().includes('auth');
        const isFeatureUser = feature.name.toLowerCase().includes('user');

        let isMatch = match.matches;
        let role: MappingRole = 'STORAGE';
        let confidence = match.confidence;

        if (isUserRelated) {
          if (isFeatureUser) {
            isMatch = true;
            role = 'IMPLEMENTATION';
            confidence = Math.max(0.9, confidence);
          } else if (isFeatureAuth) {
            isMatch = true;
            role = 'STORAGE';
            confidence = Math.max(0.85, confidence);
          }
        }

        if (isMatch) {
          seenEntities.add(entity.entityId || entity.name);
          const candidate: MappingCandidate = {
            candidateId: `cand_db_${randomUUID().slice(0, 8)}`,
            featureId: feature.id,
            resourceId: entity.entityId || entity.name,
            resourceType: 'DATABASE_ENTITY',
            proposedRole: role,
            evidence: [
              {
                evidenceId: `ev_db_${randomUUID().slice(0, 8)}`,
                sourceType: 'DATABASE_ENTITY',
                sourceId: entity.entityId || entity.name,
                evidenceType: 'DATABASE_PERSISTENCE',
                description: `Database entity "${entity.name}" (table: ${entity.tableName || entity.name}) stores state for "${feature.name}" with role ${role}`,
                strength: 0.85,
                confidence,
                metadata: {
                  entityId: entity.entityId,
                  tableName: entity.tableName,
                  fields: entity.fields,
                },
                timestamp: Date.now(),
              },
            ],
            score: confidence,
            confidence: {
              level: scoreToMappingConfidenceLevel(confidence),
              score: confidence,
              reasons: [`Database entity ${entity.name} provides storage/persistence`],
            },
            sources: ['DATABASE_ENTITY'],
            conflicts: [],
            status: 'DETECTED',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          candidates.push(candidate);
        }
      }
    }

    // 2. Symbols representing repositories/entities (e.g. UserRepository)
    if (context.symbols) {
      for (const sym of context.symbols) {
        const lower = sym.name.toLowerCase();
        if (lower.includes('repository') || lower.includes('entity') || lower.includes('dao') || lower.includes('schema')) {
          if (seenEntities.has(sym.id || sym.name)) continue;

          const isUserRelated = lower.includes('user');
          const isFeatureAuth = feature.name.toLowerCase().includes('auth');
          const isFeatureUser = feature.name.toLowerCase().includes('user');

          let match = MappingMatcher.matchesFeature(feature, sym.name);
          let role: MappingRole = 'STORAGE';
          let isMatch = match.matches;
          let confidence = match.confidence;

          if (isUserRelated) {
            if (isFeatureUser) {
              isMatch = true;
              role = 'IMPLEMENTATION';
              confidence = Math.max(0.9, confidence);
            } else if (isFeatureAuth) {
              isMatch = true;
              role = 'STORAGE';
              confidence = Math.max(0.85, confidence);
            }
          }

          if (isMatch) {
            seenEntities.add(sym.id || sym.name);
            const candidate: MappingCandidate = {
              candidateId: `cand_dbsym_${randomUUID().slice(0, 8)}`,
              featureId: feature.id,
              resourceId: sym.id || sym.name,
              resourceType: 'DATABASE',
              proposedRole: role,
              evidence: [
                {
                  evidenceId: `ev_dbsym_${randomUUID().slice(0, 8)}`,
                  sourceType: 'DATABASE',
                  sourceId: sym.id || sym.name,
                  evidenceType: 'REPOSITORY_PERSISTENCE_SYMBOL',
                  description: `Storage symbol "${sym.name}" in ${sym.filePath} manages persistence for "${feature.name}"`,
                  strength: 0.85,
                  confidence,
                  metadata: {
                    name: sym.name,
                    filePath: sym.filePath,
                  },
                  timestamp: Date.now(),
                },
              ],
              score: confidence,
              confidence: {
                level: scoreToMappingConfidenceLevel(confidence),
                score: confidence,
                reasons: [`Storage repository/entity symbol mapped to feature`],
              },
              sources: ['DATABASE'],
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

  public discoverMappings(context: MappingContext): MappingCandidate[] {
    return [];
  }
}
