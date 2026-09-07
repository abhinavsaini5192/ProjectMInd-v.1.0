import type { MappingResourceType } from '../../mapping/models/MappingResourceType';
import type { FeatureFlowStep } from './FeatureFlowStep';

export interface FeatureFlowNodeMetadata {
  featureBoundary?: boolean;
  targetFeatureId?: string;
  sourceFeatureId?: string;
  operation?: string;
  method?: string;
  route?: string;
  conditions?: string[];
  asynchronous?: boolean;
  entryPointType?: 'API' | 'CLI' | 'UI' | 'SCHEDULED' | 'EVENT';
  tags?: string[];
  [key: string]: any;
}

export interface FeatureFlowNode {
  nodeId: string;
  resourceId: string;
  resourceType: MappingResourceType;
  stepType: FeatureFlowStep;
  label: string;
  metadata: FeatureFlowNodeMetadata;
  confidence: number;
}
