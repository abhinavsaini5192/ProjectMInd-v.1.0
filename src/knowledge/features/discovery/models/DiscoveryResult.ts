import type { Feature } from '../../models/Feature';
import type { FeatureCandidate } from './FeatureCandidate';
import type { DiscoveryConflict } from './DiscoveryConflict';

export interface DiscoveryStatistics {
  evidenceCount: number;
  candidateCount: number;
  promotedCount: number;
  rejectedCount: number;
  conflictCount: number;
  duplicateCount: number;
  slmCalls: number;
  tokensUsed: number;
  durationMs: number;
}

export interface DiscoveryResult {
  runId: string;
  repositoryId: string;
  mode: 'FULL' | 'INCREMENTAL' | 'TARGETED';
  startedAt: number;
  completedAt: number;
  candidates: FeatureCandidate[];
  promotedFeatures: Feature[];
  rejectedCandidates: FeatureCandidate[];
  conflicts: DiscoveryConflict[];
  statistics: DiscoveryStatistics;
}
