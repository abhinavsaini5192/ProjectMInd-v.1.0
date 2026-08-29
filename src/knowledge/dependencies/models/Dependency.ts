import { DependencyCategory } from './DependencyCategory';

export interface DependencyEvidence {
  description: string;
  sourceType: 'import' | 'call' | 'constructor_injection' | 'config_reference' | 'db_access' | 'route_mapping' | 'framework_annotation' | 'parser_observation' | 'inferred_ownership';
  confidenceScore: number; // 0.0 to 1.0
  relationshipId?: string; // Links back to the L2.4 Relationship fact
}

export interface IDependency {
  id: string; // Hash of sourceId + targetId + category
  sourceId: string; // Symbol ID
  targetId: string; // Symbol ID
  category: DependencyCategory;
  confidence: number;
  evidence: DependencyEvidence[];
  version: number;
  hash: string; // Structural hash of evidence/confidence
  featureId?: string; // L2.6 Extensibility hook
}

export class Dependency implements IDependency {
  constructor(
    public id: string,
    public sourceId: string,
    public targetId: string,
    public category: DependencyCategory,
    public confidence: number,
    public evidence: DependencyEvidence[],
    public version: number,
    public hash: string,
    public featureId?: string
  ) {}
}
