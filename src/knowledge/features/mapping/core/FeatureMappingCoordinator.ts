import { randomUUID } from 'crypto';
import type { Feature } from '../../models/Feature';
import type { IFeatureMappingSource, MappingContext } from '../interfaces/IFeatureMappingSource';
import type { MappingCandidate } from '../models/MappingCandidate';
import type { FeatureResourceMapping } from '../models/FeatureResourceMapping';
import type { MappingResult, MappingStatistics } from '../models/MappingResult';
import { FeatureMappingScorer } from './FeatureMappingScorer';
import { FeatureMappingValidator } from './FeatureMappingValidator';
import { FeatureMappingResolver } from './FeatureMappingResolver';
import { FileMappingSource } from '../sources/FileMappingSource';
import { SymbolMappingSource } from '../sources/SymbolMappingSource';
import { ModuleMappingSource } from '../sources/ModuleMappingSource';
import { EndpointMappingSource } from '../sources/EndpointMappingSource';
import { DependencyMappingSource } from '../sources/DependencyMappingSource';
import { ConfigurationMappingSource } from '../sources/ConfigurationMappingSource';
import { DatabaseMappingSource } from '../sources/DatabaseMappingSource';
import { TestMappingSource } from '../sources/TestMappingSource';
import { UIComponentMappingSource } from '../sources/UIComponentMappingSource';
import { CommandMappingSource } from '../sources/CommandMappingSource';
import { DocumentationMappingSource } from '../sources/DocumentationMappingSource';

export class FeatureMappingCoordinator {
  private sources: IFeatureMappingSource[];
  private scorer = new FeatureMappingScorer();
  private validator = new FeatureMappingValidator();
  private resolver = new FeatureMappingResolver();

  constructor(sources?: IFeatureMappingSource[]) {
    if (sources && sources.length > 0) {
      this.sources = [...sources];
    } else {
      this.sources = [
        new FileMappingSource(),
        new SymbolMappingSource(),
        new ModuleMappingSource(),
        new EndpointMappingSource(),
        new DependencyMappingSource(),
        new ConfigurationMappingSource(),
        new DatabaseMappingSource(),
        new TestMappingSource(),
        new UIComponentMappingSource(),
        new CommandMappingSource(),
        new DocumentationMappingSource(),
      ];
    }
  }

  public registerSource(source: IFeatureMappingSource): void {
    this.sources.push(source);
  }

  public async coordinateFeatureMapping(
    feature: Feature,
    context: MappingContext,
    existingMappings: FeatureResourceMapping[] = []
  ): Promise<MappingResult> {
    const startedAt = Date.now();
    const runId = `run_map_${randomUUID().slice(0, 8)}`;
    const allCandidates: MappingCandidate[] = [];
    let sourcesExecuted = 0;

    // 1. Execute mapping sources
    for (const source of this.sources) {
      try {
        const cands = await source.mapFeature(feature, context);
        allCandidates.push(...cands);
        sourcesExecuted++;
      } catch (err) {
        // Fault isolation per source
      }
    }

    // 2. Score candidates
    for (const cand of allCandidates) {
      this.scorer.scoreCandidate(cand);
    }

    // 3. Validate candidates
    const validCandidates: MappingCandidate[] = [];
    for (const cand of allCandidates) {
      const { valid } = this.validator.validateCandidate(cand, context.repositoryId);
      if (valid) {
        validCandidates.push(cand);
      }
    }

    // 4. Resolve candidates into canonical FeatureResourceMapping entities
    const { resolvedMappings, conflicts } = this.resolver.resolve(validCandidates, existingMappings);

    // Differentiate new vs updated mappings
    const existingIds = new Set(existingMappings.map((m) => m.mappingId));
    const newMappings = resolvedMappings.filter((m) => !existingIds.has(m.mappingId));
    const updatedMappings = resolvedMappings.filter((m) => existingIds.has(m.mappingId));

    const completedAt = Date.now();
    const statistics: MappingStatistics = {
      resourcesEvaluated: allCandidates.length,
      candidatesGenerated: allCandidates.length,
      mappingsCreated: newMappings.length,
      mappingsUpdated: updatedMappings.length,
      mappingsDeactivated: 0,
      conflictsDetected: conflicts.length,
      sourcesExecuted,
      duration: completedAt - startedAt,
    };

    return {
      runId,
      featureId: feature.id,
      startedAt,
      completedAt,
      mappings: resolvedMappings,
      newMappings,
      updatedMappings,
      deactivatedMappings: [],
      conflicts,
      statistics,
    };
  }
}
