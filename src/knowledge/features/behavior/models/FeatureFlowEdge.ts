import type { FeatureBehaviorEvidence } from './FeatureBehaviorEvidence';

export type FeatureFlowRelationType =
  | 'CALLS'
  | 'READS'
  | 'WRITES'
  | 'VALIDATES'
  | 'AUTHORIZES'
  | 'TRANSFORMS'
  | 'EMITS'
  | 'CONSUMES'
  | 'AWAIT'
  | 'RETURNS'
  | 'FAILS_TO'
  | 'REDIRECTS_TO'
  | 'TRIGGERS';

export const VALID_FEATURE_FLOW_RELATION_TYPES: readonly FeatureFlowRelationType[] = [
  'CALLS',
  'READS',
  'WRITES',
  'VALIDATES',
  'AUTHORIZES',
  'TRANSFORMS',
  'EMITS',
  'CONSUMES',
  'AWAIT',
  'RETURNS',
  'FAILS_TO',
  'REDIRECTS_TO',
  'TRIGGERS',
] as const;

export function isValidFeatureFlowRelationType(rel: string): rel is FeatureFlowRelationType {
  return VALID_FEATURE_FLOW_RELATION_TYPES.includes(rel as FeatureFlowRelationType);
}

export interface FeatureFlowEdge {
  edgeId: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationType: FeatureFlowRelationType;
  condition?: string;
  asynchronous: boolean;
  confidence: number;
  evidence: FeatureBehaviorEvidence[];
  metadata?: Record<string, any>;
}
