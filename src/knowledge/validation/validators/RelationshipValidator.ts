import { ValidationIssue } from '../models/ValidationIssue';
import { Severity } from '../models/Severity';

export class RelationshipValidator {
  constructor(private symbolRegistry: any, private relationshipRegistry: any) {}

  public validate(): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const relationships = this.relationshipRegistry.getAll();

    for (const rel of relationships) {
      if (!this.symbolRegistry.has(rel.sourceId)) {
        issues.push({
          domain: 'relationships',
          entityId: rel.id,
          message: `Orphan relationship: Source symbol ${rel.sourceId} does not exist.`,
          severity: Severity.ERROR
        });
      }
      if (!this.symbolRegistry.has(rel.targetId)) {
        issues.push({
          domain: 'relationships',
          entityId: rel.id,
          message: `Orphan relationship: Target symbol ${rel.targetId} does not exist.`,
          severity: Severity.ERROR
        });
      }
    }
    
    return issues;
  }
}
