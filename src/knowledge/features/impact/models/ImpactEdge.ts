import type { ImpactDirection } from './ImpactDirection.js';

export interface ImpactEdge {
  sourceNodeId: string;
  targetNodeId: string;
  relationshipType: string;
  direction: ImpactDirection;
  confidence: number;
  evidence?: string;
  metadata?: Record<string, any>;
}
