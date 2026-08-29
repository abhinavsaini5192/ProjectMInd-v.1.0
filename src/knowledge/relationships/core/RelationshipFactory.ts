import { Relationship } from '../models/Relationship';
import { RelationshipType } from '../models/RelationshipType';
import { RelationshipEvidence } from '../models/RelationshipEvidence';
import crypto from 'crypto';

export class RelationshipFactory {
  /**
   * Generates a stable deterministic ID for an edge.
   */
  public generateId(sourceId: string, targetId: string, type: RelationshipType): string {
    const payload = `${sourceId}:${type}:${targetId}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  public create(
    sourceId: string,
    targetId: string,
    type: RelationshipType,
    direction: 'directed' | 'bidirectional',
    evidence: RelationshipEvidence[],
    confidence: number = 1.0,
    weight: number = 1.0,
    metadata: Record<string, any> = {}
  ): Relationship {
    const id = this.generateId(sourceId, targetId, type);
    const now = Date.now();

    return {
      id,
      sourceId,
      targetId,
      type,
      direction,
      confidence,
      weight,
      version: 1,
      evidence,
      metadata,
      history: ['Created'],
      created: now,
      updated: now
    };
  }
}
