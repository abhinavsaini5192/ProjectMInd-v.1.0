import { SourceLocation } from '../../ast/models/UniversalNode';

export interface RelationshipEvidence {
  description: string;
  location?: SourceLocation;
  astContext?: string; // Optional snippet of the AST that proves this relationship
  confidenceScore: number; // 0.0 to 1.0
}
