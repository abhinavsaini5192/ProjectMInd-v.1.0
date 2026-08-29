import { FeatureId } from '../models/FeatureId';
import { FeatureStatus } from '../models/FeatureStatus';

export interface FeatureCreatedEvent {
  type: 'FEATURE_CREATED';
  featureId: FeatureId;
  repositoryId: string;
  timestamp: number;
  version: number;
}

export interface FeatureUpdatedEvent {
  type: 'FEATURE_UPDATED';
  featureId: FeatureId;
  repositoryId: string;
  timestamp: number;
  version: number;
  changeType?: string;
}

export interface FeatureDeletedEvent {
  type: 'FEATURE_DELETED';
  featureId: FeatureId;
  repositoryId: string;
  timestamp: number;
}

export interface FeatureStatusChangedEvent {
  type: 'FEATURE_STATUS_CHANGED';
  featureId: FeatureId;
  repositoryId: string;
  oldStatus: FeatureStatus;
  newStatus: FeatureStatus;
  timestamp: number;
}
