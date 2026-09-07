import type { FeatureId } from '../../models/FeatureId';
import type { FeatureBehaviorConfidence } from './FeatureBehaviorConfidence';
import type { FeatureBehaviorEvidence } from './FeatureBehaviorEvidence';
import type { FeatureFlow } from './FeatureFlow';
import type { FeatureFlowNode } from './FeatureFlowNode';

export interface FeatureBehavior {
  behaviorId: string;
  featureId: FeatureId;
  flows: FeatureFlow[];
  entryPoints: FeatureFlowNode[];
  primaryFlows: FeatureFlow[];
  alternativeFlows: FeatureFlow[];
  failureFlows: FeatureFlow[];
  confidence: FeatureBehaviorConfidence;
  evidence: FeatureBehaviorEvidence[];
  active: boolean;
  behaviorVersion: number;
  knowledgeVersion: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}
