import { Relationship } from '../models/Relationship';
import { RelationshipVersionManager } from './RelationshipVersionManager';
import { KernelEventDispatcher } from '../../../kernel/core/KernelEventDispatcher';

export const RELATIONSHIP_CREATED = 'Relationship:Created';
export const RELATIONSHIP_UPDATED = 'Relationship:Updated';
export const RELATIONSHIP_REMOVED = 'Relationship:Removed';

export class RelationshipLifecycleManager {
  constructor(
    private versionManager: RelationshipVersionManager,
    private dispatcher: KernelEventDispatcher
  ) {}

  public processEvolution(existing: Relationship | undefined, candidate: Relationship): Relationship {
    if (!existing) {
      this.dispatcher.publish(RELATIONSHIP_CREATED, { id: candidate.id });
      return candidate;
    }

    const candidateHash = this.versionManager.generateHash(candidate);
    const existingHash = this.versionManager.generateHash(existing);

    if (this.versionManager.isModified(existingHash, candidateHash)) {
      existing.evidence = candidate.evidence;
      existing.metadata = candidate.metadata;
      existing.confidence = candidate.confidence;
      existing.weight = candidate.weight;
      existing.version += 1;
      existing.updated = Date.now();
      existing.history.push(`Updated to version ${existing.version}`);
      
      this.dispatcher.publish(RELATIONSHIP_UPDATED, { id: existing.id, version: existing.version });
    }

    return existing;
  }
}
