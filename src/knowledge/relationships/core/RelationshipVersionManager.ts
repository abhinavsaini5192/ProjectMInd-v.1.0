import crypto from 'crypto';
import { Relationship } from '../models/Relationship';

export class RelationshipVersionManager {
  /**
   * Generates a structural hash based on evidence and metadata to detect actual changes.
   */
  public generateHash(relationship: Relationship): string {
    const payload = JSON.stringify({
      evidence: relationship.evidence,
      metadata: relationship.metadata,
      confidence: relationship.confidence,
      weight: relationship.weight
    });
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  public isModified(oldHash: string, newHash: string): boolean {
    return oldHash !== newHash;
  }
}
