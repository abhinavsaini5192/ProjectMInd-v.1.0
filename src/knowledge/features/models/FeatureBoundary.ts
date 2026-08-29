export interface FeatureBoundary {
  featureId: string;
  allowedOutboundFeatureIds: string[];
  allowedInboundFeatureIds: string[];
  strictMode: boolean; // If true, throws architecture violations on cross-domain bleed
}
