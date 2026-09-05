import type { DiscoveryContext } from '../models/DiscoverySource';
import type { DiscoveryResult } from '../models/DiscoveryResult';
import type { FeatureCandidate } from '../models/FeatureCandidate';
import type { Feature } from '../../models/Feature';
import { FeatureDiscoveryEngine } from '../core/FeatureDiscoveryEngine';

export class FeatureDiscoveryAPI {
  constructor(private engine: FeatureDiscoveryEngine) {}

  public async discoverFeatures(context: DiscoveryContext): Promise<DiscoveryResult> {
    return this.engine.discoverFeatures(context);
  }

  public async discoverFeatureCandidates(context: DiscoveryContext): Promise<FeatureCandidate[]> {
    return this.engine.discoverFeatureCandidates(context);
  }

  public getCandidate(candidateId: string): FeatureCandidate | undefined {
    return this.engine.getCandidate(candidateId);
  }

  public listCandidates(): FeatureCandidate[] {
    return this.engine.listCandidates();
  }

  public async validateCandidate(candidateId: string): Promise<{ valid: boolean; issues: string[] }> {
    return this.engine.validateCandidate(candidateId);
  }

  public async promoteCandidate(candidateId: string): Promise<Feature> {
    return this.engine.promoteCandidate(candidateId);
  }

  public async rejectCandidate(candidateId: string, reason: string): Promise<void> {
    return this.engine.rejectCandidate(candidateId, reason);
  }

  public explainCandidate(candidateId: string): Record<string, any> {
    return this.engine.explainCandidate(candidateId);
  }

  public getDiscoveryRun(runId: string): DiscoveryResult | undefined {
    return this.engine.getDiscoveryRun(runId);
  }
}
