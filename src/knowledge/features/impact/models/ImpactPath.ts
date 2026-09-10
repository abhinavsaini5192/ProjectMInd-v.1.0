import type { ImpactNode } from './ImpactNode.js';
import type { ImpactEdge } from './ImpactEdge.js';
import type { ImpactType } from './ImpactType.js';
import type { ImpactConfidence } from './ImpactConfidence.js';
import type { ImpactEvidence } from './ImpactEvidence.js';

export interface ImpactPath {
  pathId: string;
  sourceNode: ImpactNode;
  targetNode: ImpactNode;
  nodes: ImpactNode[];
  edges: ImpactEdge[];
  pathType: ImpactType;
  distance: number;
  confidence: ImpactConfidence;
  evidence: ImpactEvidence[];
  metadata?: Record<string, any>;
}
