import { RelationshipType } from './RelationshipType';
import { RelationshipEvidence } from './RelationshipEvidence';

export interface Relationship {
  id: string; // Stable Unique Identity derived from source + target + type
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  direction: 'directed' | 'bidirectional';
  confidence: number;
  weight: number;
  version: number;
  evidence: RelationshipEvidence[];
  metadata: Record<string, any>;
  history: string[];
  created: number; // Timestamp
  updated: number; // Timestamp
}
