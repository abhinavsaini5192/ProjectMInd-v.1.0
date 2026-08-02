import { KnowledgeGraph } from '../intelligence/engines/KnowledgeGraphBuilder';
import { ProjectMindError } from '../errors';

export class SchemaManager {
  // In a full implementation, this manages Zod schemas and schema versions.
  // We've already defined most schemas in the respective modules.
  public getCurrentSchemaVersion(): string {
    return '1.0.0';
  }
}

export class KnowledgeValidator {
  /**
   * Scans the graph for inconsistencies (e.g. broken relationships, missing facts)
   */
  public validate(graph: KnowledgeGraph): { valid: boolean, errors: string[] } {
    const errors: string[] = [];

    // Simple validation: check if fact IDs are valid
    for (const [id, fact] of graph.facts.entries()) {
      if (id !== fact.id) {
        errors.push(`Mismatched ID for fact: map key ${id} does not match fact ID ${fact.id}`);
      }
    }
    
    // Check for broken references in relationships
    for (const fact of graph.facts.values()) {
      if (fact.relationships) {
        for (const rel of fact.relationships) {
          if (!graph.facts.has(rel.targetId)) {
             // We don't fail immediately, just log an error
             // We might be building partial graphs. But for full validation, it's an error.
             errors.push(`Broken relationship: ${fact.id} ${rel.type} ${rel.targetId} (target missing)`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
