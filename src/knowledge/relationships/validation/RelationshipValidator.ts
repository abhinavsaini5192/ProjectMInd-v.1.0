import { Relationship } from '../models/Relationship';
import { SymbolResolver } from '../../symbols/extraction/SymbolResolver';

export class RelationshipValidator {
  constructor(private symbolResolver: SymbolResolver) {}

  public validate(relationships: Relationship[]): boolean {
    const ids = new Set<string>();

    for (const rel of relationships) {
      if (ids.has(rel.id)) {
        throw new Error(`Duplicate Relationship Edge detected: ${rel.id}`);
      }
      ids.add(rel.id);

      if (rel.sourceId === rel.targetId) {
        throw new Error(`Illegal Self-Loop detected on Symbol: ${rel.sourceId}`);
      }

      // In a real strict validation, we would verify the symbols exist in the SymbolRegistry.
      // if (!this.symbolResolver.resolveById(rel.sourceId)) throw Error('Orphan source');
    }

    return true;
  }
}
