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

export class DataDependencySource implements IFeatureRelationshipSource {
  public readonly sourceType = 'DATA';
  public readonly name = 'DataDependencySource';

  public getSourceType(): string {
    return this.sourceType;
  }

  public supports(relationshipType: FeatureRelationshipType): boolean {
    return (
      relationshipType === 'USES' ||
      relationshipType === 'SHARES_DATA' ||
      relationshipType === 'PROVIDES' ||
      relationshipType === 'FEEDS'
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
    if (!context.databaseEntities || context.databaseEntities.length === 0) {
      return candidates;
    }

    const resourceMap = DependencySourceHelper.buildResourceToFeaturesMap(allFeatures, context);
    const seenPairs = new Set<string>();

    for (const entity of context.databaseEntities) {
      const entityId = entity.entityId || (entity as any).entityName || entity.name || (entity as any).tableName || '';
      const entityName = entity.name || (entity as any).entityName || entity.entityId || (entity as any).tableName || entityId;

      const ownerFeatures = [
        ...DependencySourceHelper.getFeaturesForResource(entityId, resourceMap),
        ...DependencySourceHelper.getFeaturesForResource(entityName, resourceMap),
        ...(entity.filePath ? DependencySourceHelper.getFeaturesForResource(entity.filePath, resourceMap) : []),
      ];

      const uniqueOwners = Array.from(new Set(ownerFeatures));

      // 1. Shared data store: if entity is mapped to multiple features -> SHARES_DATA
      if (uniqueOwners.length > 1) {
        for (let i = 0; i < uniqueOwners.length; i++) {
          for (let j = i + 1; j < uniqueOwners.length; j++) {
            const featA = uniqueOwners[i]!;
            const featB = uniqueOwners[j]!;

            const pairKey = `${featA}:::${featB}:::SHARES_DATA:::${entityName}`;
            if (!seenPairs.has(pairKey)) {
              seenPairs.add(pairKey);
              candidates.push({
                candidateId: `cand_data_shared_${randomUUID().slice(0, 8)}`,
                sourceFeatureId: featA,
                targetFeatureId: featB,
                proposedType: 'SHARES_DATA',
                direction: 'BIDIRECTIONAL',
                evidence: [
                  {
                    evidenceId: `ev_data_shared_${randomUUID().slice(0, 8)}`,
                    sourceType: 'DATA',
                    sourceId: entityName,
                    evidenceType: 'DATABASE_SHARED_ENTITY',
                    description: `Database entity "${entityName}" is shared between feature "${featA}" and feature "${featB}"`,
                    strength: 0.85,
                    confidence: 0.85,
                    metadata: { entityName, entityId },
                    timestamp: Date.now(),
                  },
                ],
                score: 0.85,
                confidence: {
                  level: scoreToFeatureRelationshipConfidenceLevel(0.85),
                  score: 0.85,
                  reasons: [`Database entity ${entityName} is mapped across multiple features`],
                },
                sources: ['DATA'],
                conflicts: [],
                status: 'DETECTED',
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
            }
          }
        }
      }

      const accessingFeatures: string[] = (entity as any).accessedBy || (entity as any).readers || [];

      // Check foreign keys / relationships to other entities
      const relations: string[] = [...(entity.relationships || [])];
      if (Array.isArray((entity as any).foreignKeys)) {
        for (const fk of (entity as any).foreignKeys) {
          if (fk.referencedEntity) relations.push(fk.referencedEntity);
          if (fk.targetEntity) relations.push(fk.targetEntity);
          if (fk.entity) relations.push(fk.entity);
        }
      }

      for (const rel of relations) {
        const relatedOwners = DependencySourceHelper.getFeaturesForResource(rel, resourceMap);
        for (const ownerId of uniqueOwners) {
          for (const relOwnerId of relatedOwners) {
            if (ownerId === relOwnerId) continue;

            const pairKey = `${ownerId}:::${relOwnerId}:::USES:::SCHEMA_RELATION`;
            if (seenPairs.has(pairKey)) continue;
            seenPairs.add(pairKey);

            const candidate: FeatureRelationshipCandidate = {
              candidateId: `cand_data_rel_${randomUUID().slice(0, 8)}`,
              sourceFeatureId: ownerId,
              targetFeatureId: relOwnerId,
              proposedType: 'USES',
              direction: 'DIRECTED',
              evidence: [
                {
                  evidenceId: `ev_data_rel_${randomUUID().slice(0, 8)}`,
                  sourceType: 'DATA',
                  sourceId: `${entityName} -> ${rel}`,
                  evidenceType: 'DATABASE_FOREIGN_KEY_RELATION',
                  description: `Database entity "${entityName}" in feature "${ownerId}" references entity "${rel}" in feature "${relOwnerId}"`,
                  strength: 0.75,
                  confidence: 0.75,
                  metadata: {
                    sourceEntity: entityName,
                    targetEntity: rel,
                  },
                  timestamp: Date.now(),
                },
              ],
              score: 0.75,
              confidence: {
                level: scoreToFeatureRelationshipConfidenceLevel(0.75),
                score: 0.75,
                reasons: [`Database entity ${entityName} references foreign entity ${rel}`],
              },
              sources: ['DATA'],
              conflicts: [],
              status: 'DETECTED',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            candidates.push(candidate);
          }
        }
      }

      // Check explicit readers
      for (const accessor of accessingFeatures) {
        const accessorFeatures = DependencySourceHelper.getFeaturesForResource(accessor, resourceMap);
        for (const accFeatId of accessorFeatures) {
          for (const ownerFeatId of uniqueOwners) {
            if (accFeatId === ownerFeatId) continue;

            const pairKey = `${accFeatId}:::${ownerFeatId}:::USES:::DATA_ACCESS`;
            if (seenPairs.has(pairKey)) continue;
            seenPairs.add(pairKey);

            const candidate: FeatureRelationshipCandidate = {
              candidateId: `cand_data_acc_${randomUUID().slice(0, 8)}`,
              sourceFeatureId: accFeatId,
              targetFeatureId: ownerFeatId,
              proposedType: 'USES',
              direction: 'DIRECTED',
              evidence: [
                {
                  evidenceId: `ev_data_acc_${randomUUID().slice(0, 8)}`,
                  sourceType: 'DATA',
                  sourceId: `${accessor} -> ${entityName}`,
                  evidenceType: 'DATABASE_ENTITY_CONSUMPTION',
                  description: `Feature "${accFeatId}" reads/consumes database entity "${entityName}" owned by feature "${ownerFeatId}"`,
                  strength: 0.70,
                  confidence: 0.70,
                  metadata: {
                    accessor,
                    entityName,
                  },
                  timestamp: Date.now(),
                },
              ],
              score: 0.70,
              confidence: {
                level: scoreToFeatureRelationshipConfidenceLevel(0.70),
                score: 0.70,
                reasons: [`Feature ${accFeatId} queries/reads entity ${entityName}`],
              },
              sources: ['DATA'],
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
