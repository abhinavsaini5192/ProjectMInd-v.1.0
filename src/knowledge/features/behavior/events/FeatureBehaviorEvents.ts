export const FeatureBehaviorEvents = {
  AnalysisStarted: 'feature.behavior.analysis.started',
  CandidateDetected: 'feature.behavior.candidate.detected',
  Updated: 'feature.behavior.updated',
  ConflictDetected: 'feature.behavior.conflict.detected',
  Stale: 'feature.behavior.stale',
  AnalysisCompleted: 'feature.behavior.analysis.completed',
} as const;

export type FeatureBehaviorEventName =
  (typeof FeatureBehaviorEvents)[keyof typeof FeatureBehaviorEvents];
