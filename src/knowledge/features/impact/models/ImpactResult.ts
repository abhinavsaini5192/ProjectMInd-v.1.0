import type { ChangeImpact } from './ChangeImpact.js';
import type { FeatureImpact } from './FeatureImpact.js';
import type { ResourceImpact } from './ResourceImpact.js';
import type { ImpactPath } from './ImpactPath.js';
import type { ImpactConflict } from './ImpactConflict.js';
import type { ImpactVersion, AnalysisMode } from './ImpactVersion.js';

export interface ImpactStatistics {
  changesAnalyzed: number;
  resourcesAffected: number;
  featuresAffected: number;
  directImpactCount: number;
  indirectImpactCount: number;
  highImpactCount: number;
  criticalImpactCount: number;
  verificationImpactCount: number;
  conflictsDetected: number;
  pathsGenerated: number;
  maxDepthReached: number;
  skippedNodes: number;
  analysisDuration: number;
}

export interface ImpactResult {
  runId: string;
  repositoryId: string;
  analysisMode: AnalysisMode;
  sourceChanges: ChangeImpact[];
  directImpacts: FeatureImpact[];
  indirectImpacts: FeatureImpact[];
  resourceImpacts: ResourceImpact[];
  featureImpacts: FeatureImpact[];
  impactPaths: ImpactPath[];
  conflicts: ImpactConflict[];
  staleImpacts: (FeatureImpact | ResourceImpact)[];
  statistics: ImpactStatistics;
  version: ImpactVersion;
  startedAt: number;
  completedAt: number;
  metadata?: Record<string, any>;
}
