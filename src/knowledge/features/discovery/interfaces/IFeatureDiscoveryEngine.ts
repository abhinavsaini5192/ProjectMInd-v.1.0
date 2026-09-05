import type { DiscoveryContext } from '../models/DiscoverySource';
import type { FeatureCandidate } from '../models/FeatureCandidate';
import type { DiscoveryResult } from '../models/DiscoveryResult';
import type { Feature } from '../../models/Feature';

export interface IFeatureDiscoveryEngine {
  discoverFeatures(context: DiscoveryContext): Promise<DiscoveryResult>;
  discoverFeatureCandidates(context: DiscoveryContext): Promise<FeatureCandidate[]>;
  getCandidate(candidateId: string): FeatureCandidate | undefined;
  listCandidates(): FeatureCandidate[];
  validateCandidate(candidateId: string): Promise<{ valid: boolean; issues: string[] }>;
  promoteCandidate(candidateId: string): Promise<Feature>;
  rejectCandidate(candidateId: string, reason: string): Promise<void>;
  explainCandidate(candidateId: string): Record<string, any>;
  getDiscoveryRun(runId: string): DiscoveryResult | undefined;
}
