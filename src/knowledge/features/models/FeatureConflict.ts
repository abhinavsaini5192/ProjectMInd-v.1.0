import { FeatureId } from './FeatureId';

export interface FeatureConflict {
  conflictId: string;
  featureId: FeatureId;
  type: 'DUPLICATE_REGISTRATION' | 'INVALID_REFERENCE' | 'INVALID_REPOSITORY_SCOPE' | 'VERSION_CONFLICT';
  description: string;
  detectedAt: number;
}
