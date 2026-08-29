import { ContextItem } from '../models/ContextItem';
import { ContextConflict } from '../models/ContextConflict';

export interface DeduplicationResult {
  deduplicatedItems: ContextItem[];
  conflicts: ContextConflict[];
}

export class ContextDeduplicator {
  /**
   * Identifies identical or overlapping facts, merges their provenance and sources,
   * and flags direct contradictions as ContextConflicts.
   */
  public deduplicate(items: ContextItem[]): DeduplicationResult {
    const deduplicated: ContextItem[] = [];
    const conflicts: ContextConflict[] = [];
    const seenContentMap = new Map<string, ContextItem>();

    for (const item of items) {
      const normalizedContent = item.content.trim().toLowerCase();

      // Check if we've seen this exact content
      if (seenContentMap.has(normalizedContent)) {
        const existing = seenContentMap.get(normalizedContent)!;
        
        // Merge sources preserving provenance
        for (const src of item.sources) {
          if (!existing.sources.some(s => s.sourceId === src.sourceId && s.sourceType === src.sourceType)) {
            existing.sources.push(src);
          }
        }

        // Keep highest confidence and priority
        existing.confidence = Math.max(existing.confidence, item.confidence);
        existing.priority = Math.min(existing.priority, item.priority); // lower number = higher priority
        existing.relevance = Math.max(existing.relevance, item.relevance);
      } else {
        // Check for potential contradictions (e.g. same topic or entity with opposing assertions)
        this.checkForConflicts(item, Array.from(seenContentMap.values()), conflicts);

        seenContentMap.set(normalizedContent, { ...item, sources: [...item.sources] });
        deduplicated.push(seenContentMap.get(normalizedContent)!);
      }
    }

    return {
      deduplicatedItems: deduplicated,
      conflicts
    };
  }

  private checkForConflicts(item: ContextItem, existingItems: ContextItem[], conflicts: ContextConflict[]): void {
    const itemLower = item.content.toLowerCase();
    
    for (const existing of existingItems) {
      // Simple heuristic for contradictory architectural/config statements on same entity
      if (
        item.metadata?.entityName &&
        existing.metadata?.entityName &&
        item.metadata.entityName === existing.metadata.entityName &&
        item.type === existing.type &&
        item.content !== existing.content
      ) {
        conflicts.push({
          conflictId: `conflict_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          topic: item.metadata.entityName,
          conflictingItems: [existing, item],
          sources: [...existing.sources, ...item.sources],
          description: `Discrepancy detected regarding ${item.metadata.entityName} across sources.`,
          severity: 'MEDIUM'
        });
      }
    }
  }
}
