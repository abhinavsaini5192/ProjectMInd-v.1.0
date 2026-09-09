export const FeatureHealthEvents = {
  AnalysisStarted: 'feature.health.analysis.started',
  SignalDetected: 'feature.health.signal.detected',
  RiskDetected: 'feature.health.risk.detected',
  StatusChanged: 'feature.health.status.changed',
  HealthDegraded: 'feature.health.degraded',
  HealthStale: 'feature.health.stale',
  AnalysisCompleted: 'feature.health.analysis.completed',
} as const;

export type FeatureHealthEventName =
  (typeof FeatureHealthEvents)[keyof typeof FeatureHealthEvents];
