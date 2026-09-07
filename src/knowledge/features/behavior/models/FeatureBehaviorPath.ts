import type { FeatureBehaviorEvidence } from './FeatureBehaviorEvidence';
import type { FeatureFlowEdge } from './FeatureFlowEdge';
import type { FeatureFlowNode } from './FeatureFlowNode';
import type { FeatureFlowType } from './FeatureFlowType';

export interface FeatureBoundaryHop {
  sourceFeatureId: string;
  targetFeatureId: string;
  nodeId: string;
}

export interface FeatureBehaviorPath {
  pathId: string;
  flowId: string;
  nodes: FeatureFlowNode[];
  edges: FeatureFlowEdge[];
  flowType: FeatureFlowType;
  confidence: number;
  featureBoundaries: FeatureBoundaryHop[];
  evidence: FeatureBehaviorEvidence[];
  metadata?: Record<string, any>;
}
