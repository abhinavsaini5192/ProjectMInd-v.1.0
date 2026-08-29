import { IDependency, Dependency, DependencyEvidence } from '../models/Dependency';
import { DependencyCategory } from '../models/DependencyCategory';
import { Relationship } from '../../relationships/models/Relationship';
import { RelationshipType } from '../../relationships/models/RelationshipType';
import crypto from 'crypto';

export class DependencyExtractor {
  
  public extractFromRelationship(rel: Relationship): IDependency {
    const category = this.inferCategory(rel);
    const evidence: DependencyEvidence = {
      description: `Inferred from L2.4 Relationship ${rel.type}`,
      sourceType: this.mapSourceType(rel.type),
      confidenceScore: rel.confidence,
      relationshipId: rel.id
    };

    const id = this.generateId(rel.sourceId, rel.targetId, category);
    const hashPayload = `${evidence.sourceType}:${evidence.confidenceScore}`;
    const hash = crypto.createHash('sha256').update(hashPayload).digest('hex');

    return new Dependency(
      id,
      rel.sourceId,
      rel.targetId,
      category,
      rel.confidence,
      [evidence],
      1,
      hash
    );
  }

  private generateId(sourceId: string, targetId: string, category: DependencyCategory): string {
    return crypto.createHash('sha256').update(`${sourceId}:${targetId}:${category}`).digest('hex');
  }

  private inferCategory(rel: Relationship): DependencyCategory {
    switch(rel.type) {
      case RelationshipType.Calls: return DependencyCategory.Code;
      case RelationshipType.Imports: return DependencyCategory.Module;
      case RelationshipType.DependsOn: return DependencyCategory.Package;
      default: return DependencyCategory.Code;
    }
  }

  private mapSourceType(type: RelationshipType): DependencyEvidence['sourceType'] {
    switch(type) {
      case RelationshipType.Calls: return 'call';
      case RelationshipType.Imports: return 'import';
      default: return 'inferred_ownership';
    }
  }
}
