export interface FeatureMetrics {
  size: number; // Number of symbols
  complexity: number; // Mock cyclomatic or structural complexity aggregation
  coupling: number; // Efferent coupling to other features
  cohesion: number; // Internal relationship density
  stability: number; // Instability metric
  health: number; // 0-100 overall score
  coverage: number; // Percentage of symbols that have associated tests
  volatility: number; // How frequently this feature is updated
}

export interface FeatureStatistics {
  totalFeatures: number;
  averageFeatureSize: number;
  mostCoupledFeatureId: string;
  mostVolatileFeatureId: string;
}
