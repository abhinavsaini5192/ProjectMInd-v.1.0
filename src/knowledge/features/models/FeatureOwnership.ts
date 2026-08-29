export interface FeatureOwnership {
  symbolId: string;
  featureIds: string[]; // Many-to-many relationship support
  primaryFeatureId: string; // The single feature with highest confidence
}
