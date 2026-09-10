export const FeatureImpactEvents = {
  AnalysisStarted: 'feature.impact.analysis.started',
  ImpactCandidateDetected: 'feature.impact.candidate.detected',
  FeatureImpactDetected: 'feature.impact.feature.detected',
  ResourceImpactDetected: 'feature.impact.resource.detected',
  ImpactPathCreated: 'feature.impact.path.created',
  ImpactConflictDetected: 'feature.impact.conflict.detected',
  FeatureImpactUpdated: 'feature.impact.updated',
  FeatureImpactStale: 'feature.impact.stale',
  AnalysisCompleted: 'feature.impact.analysis.completed',
} as const;

export type FeatureImpactEventName =
  (typeof FeatureImpactEvents)[keyof typeof FeatureImpactEvents];
