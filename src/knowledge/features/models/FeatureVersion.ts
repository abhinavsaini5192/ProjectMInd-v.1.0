import { FeatureId } from './FeatureId';

export type FeatureChangeType =
  | 'CREATED'
  | 'RENAMED'
  | 'UPDATED'
  | 'RECLASSIFIED'
  | 'REFERENCES_CHANGED'
  | 'RELATIONSHIPS_CHANGED'
  | 'STATUS_CHANGED';

export interface FeatureVersion {
  version: number;
  featureId: FeatureId;
  changedAt: number;
  changeType: FeatureChangeType;
  reason?: string;
  previousName?: string;
  snapshot?: any;
}
