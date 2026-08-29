export interface FeatureMetadata {
  tags?: string[];
  owner?: string;
  category?: string;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  externalReference?: string;
  documentationReference?: string;
  customAttributes?: Record<string, any>;
}
