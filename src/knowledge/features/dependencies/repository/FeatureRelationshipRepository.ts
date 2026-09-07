import type { IFeatureRelationshipRepository } from '../interfaces/IFeatureRelationshipRepository';
import type { FeatureRelationship } from '../models/FeatureRelationship';
import type { FeatureDependencyConflict } from '../models/FeatureDependencyConflict';
import type { FeatureRelationshipType } from '../models/FeatureRelationshipType';
import { FeatureRelationshipError } from '../errors/FeatureRelationshipError';

export class FeatureRelationshipRepository implements IFeatureRelationshipRepository {
  private relationships = new Map<string, FeatureRelationship>();
  private outgoingIndex = new Map<string, Set<string>>(); // sourceFeatureId -> Set<relationshipId>
  private incomingIndex = new Map<string, Set<string>>(); // targetFeatureId -> Set<relationshipId>
  private conflicts = new Map<string, FeatureDependencyConflict>();

  public async save(relationship: FeatureRelationship): Promise<void> {
    this.relationships.set(relationship.relationshipId, relationship);

    // Outgoing index
    if (!this.outgoingIndex.has(relationship.sourceFeatureId)) {
      this.outgoingIndex.set(relationship.sourceFeatureId, new Set());
    }
    this.outgoingIndex.get(relationship.sourceFeatureId)!.add(relationship.relationshipId);

    // Incoming index
    if (!this.incomingIndex.has(relationship.targetFeatureId)) {
      this.incomingIndex.set(relationship.targetFeatureId, new Set());
    }
    this.incomingIndex.get(relationship.targetFeatureId)!.add(relationship.relationshipId);
  }

  public async update(relationship: FeatureRelationship): Promise<void> {
    if (!this.relationships.has(relationship.relationshipId)) {
      throw new FeatureRelationshipError(`Relationship "${relationship.relationshipId}" not found for update`);
    }
    await this.save(relationship);
  }

  public async get(relationshipId: string): Promise<FeatureRelationship | null> {
    return this.relationships.get(relationshipId) || null;
  }

  public async getRelationships(featureId: string): Promise<FeatureRelationship[]> {
    const relIds = new Set<string>();
    const out = this.outgoingIndex.get(featureId);
    if (out) {
      for (const id of out) relIds.add(id);
    }
    const inc = this.incomingIndex.get(featureId);
    if (inc) {
      for (const id of inc) relIds.add(id);
    }

    return Array.from(relIds)
      .map((id) => this.relationships.get(id))
      .filter((r): r is FeatureRelationship => Boolean(r && r.active));
  }

  public async getOutgoing(featureId: string): Promise<FeatureRelationship[]> {
    const out = this.outgoingIndex.get(featureId);
    if (!out) return [];
    return Array.from(out)
      .map((id) => this.relationships.get(id))
      .filter((r): r is FeatureRelationship => Boolean(r && r.active));
  }

  public async getIncoming(featureId: string): Promise<FeatureRelationship[]> {
    const inc = this.incomingIndex.get(featureId);
    if (!inc) return [];
    return Array.from(inc)
      .map((id) => this.relationships.get(id))
      .filter((r): r is FeatureRelationship => Boolean(r && r.active));
  }

  public async getBetween(sourceFeatureId: string, targetFeatureId: string): Promise<FeatureRelationship | null> {
    const out = this.outgoingIndex.get(sourceFeatureId);
    if (!out) return null;
    for (const id of out) {
      const rel = this.relationships.get(id);
      if (rel && rel.targetFeatureId === targetFeatureId && rel.active) {
        return rel;
      }
    }
    return null;
  }

  public async getByType(type: FeatureRelationshipType): Promise<FeatureRelationship[]> {
    return Array.from(this.relationships.values()).filter(
      (r) => r.relationshipType === type && r.active
    );
  }

  public async getAll(): Promise<FeatureRelationship[]> {
    return Array.from(this.relationships.values());
  }

  public async deactivate(relationshipId: string, reason: string = 'RELATIONSHIP_REMOVED'): Promise<void> {
    const rel = this.relationships.get(relationshipId);
    if (!rel) {
      throw new FeatureRelationshipError(`Relationship "${relationshipId}" not found to deactivate`);
    }

    rel.active = false;
    rel.deactivationReason = reason;
    rel.updatedAt = Date.now();
  }

  public async saveConflict(conflict: FeatureDependencyConflict): Promise<void> {
    this.conflicts.set(conflict.conflictId, conflict);
  }

  public async queryConflicts(featureId?: string): Promise<FeatureDependencyConflict[]> {
    const all = Array.from(this.conflicts.values());
    if (featureId) {
      return all.filter((c) => c.sourceFeatureId === featureId || c.targetFeatureId === featureId);
    }
    return all;
  }
}
