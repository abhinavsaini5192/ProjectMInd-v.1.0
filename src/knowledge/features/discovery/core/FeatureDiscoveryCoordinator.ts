import type { IFeatureDiscoverySource } from '../interfaces/IFeatureDiscoverySource';
import type { DiscoveryContext } from '../models/DiscoverySource';
import type { DiscoveryEvidence } from '../models/DiscoveryEvidence';
import type { FeatureCandidate } from '../models/FeatureCandidate';
import type { DiscoveryConflict } from '../models/DiscoveryConflict';
import { FeatureCandidateGenerator } from './FeatureCandidateGenerator';
import { FeatureCandidateNormalizer } from './FeatureCandidateNormalizer';
import { FeatureEvidenceAggregator } from './FeatureEvidenceAggregator';
import { FeatureCandidateScorer } from './FeatureCandidateScorer';
import { FeatureDuplicateDetector } from './FeatureDuplicateDetector';
import { FeatureCandidateValidator } from './FeatureCandidateValidator';
import { DiscoverySourceError } from '../errors/DiscoverySourceError';

export interface CoordinatorResult {
  evidence: DiscoveryEvidence[];
  candidates: FeatureCandidate[];
  conflicts: DiscoveryConflict[];
  sourceErrors: DiscoverySourceError[];
}

import { EndpointFeatureSource } from '../sources/EndpointFeatureSource';
import { ModuleFeatureSource } from '../sources/ModuleFeatureSource';
import { SymbolFeatureSource } from '../sources/SymbolFeatureSource';
import { DependencyFeatureSource } from '../sources/DependencyFeatureSource';
import { TestFeatureSource } from '../sources/TestFeatureSource';
import { ConfigurationFeatureSource } from '../sources/ConfigurationFeatureSource';
import { DocumentationFeatureSource } from '../sources/DocumentationFeatureSource';
import { HistoryFeatureSource } from '../sources/HistoryFeatureSource';

export class FeatureDiscoveryCoordinator {
  private generator = new FeatureCandidateGenerator();
  private normalizer = new FeatureCandidateNormalizer();
  private aggregator = new FeatureEvidenceAggregator();
  private scorer = new FeatureCandidateScorer();
  private duplicateDetector = new FeatureDuplicateDetector();
  private validator = new FeatureCandidateValidator();
  private sources: IFeatureDiscoverySource[];

  constructor(sources?: IFeatureDiscoverySource[]) {
    if (sources && sources.length > 0) {
      this.sources = [...sources];
    } else {
      this.sources = [
        new EndpointFeatureSource(),
        new ModuleFeatureSource(),
        new SymbolFeatureSource(),
        new DependencyFeatureSource(),
        new TestFeatureSource(),
        new ConfigurationFeatureSource(),
        new DocumentationFeatureSource(),
        new HistoryFeatureSource(),
      ];
    }
  }

  public registerSource(source: IFeatureDiscoverySource): void {
    this.sources.push(source);
  }

  public async coordinate(context: DiscoveryContext): Promise<CoordinatorResult> {
    const allEvidence: DiscoveryEvidence[] = [];
    const sourceErrors: DiscoverySourceError[] = [];

    // 1. Gather evidence from all sources
    for (const source of this.sources) {
      try {
        const evidence = await source.discover(context);
        allEvidence.push(...evidence);
      } catch (err: any) {
        sourceErrors.push(new DiscoverySourceError(source.sourceType, err.message, err));
      }
    }

    // 2. Generate raw candidates
    const rawCandidates = this.generator.generateCandidates(allEvidence, context);

    // 3. Normalize candidates
    const { normalized } = this.normalizer.normalize(rawCandidates);

    // 4. Aggregate evidence per candidate
    for (const candidate of normalized) {
      this.aggregator.aggregate(candidate);
    }

    // 5. Score candidates
    for (const candidate of normalized) {
      this.scorer.scoreCandidate(candidate);
    }

    // 6. Detect duplicates and conflicts
    const { conflicts } = this.duplicateDetector.detectDuplicates(normalized);

    // 7. Validate candidates
    for (const candidate of normalized) {
      this.validator.validate(candidate, context);
    }

    return {
      evidence: allEvidence,
      candidates: normalized,
      conflicts,
      sourceErrors,
    };
  }
}
