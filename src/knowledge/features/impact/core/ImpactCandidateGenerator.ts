import type { IImpactSource, ImpactContext } from '../interfaces/IImpactSource.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import { MappingImpactSource } from '../sources/MappingImpactSource.js';
import { DependencyImpactSource } from '../sources/DependencyImpactSource.js';
import { BehaviorImpactSource } from '../sources/BehaviorImpactSource.js';
import { ResourceRelationshipImpactSource } from '../sources/ResourceRelationshipImpactSource.js';
import { EndpointImpactSource } from '../sources/EndpointImpactSource.js';
import { DataImpactSource } from '../sources/DataImpactSource.js';
import { IntegrationImpactSource } from '../sources/IntegrationImpactSource.js';
import { TestImpactSource } from '../sources/TestImpactSource.js';
import { ArchitectureImpactSource } from '../sources/ArchitectureImpactSource.js';
import { HealthRiskImpactSource } from '../sources/HealthRiskImpactSource.js';

export class ImpactCandidateGenerator {
  private sources: IImpactSource[];

  constructor(customSources?: IImpactSource[]) {
    this.sources = customSources || [
      new MappingImpactSource(),
      new DependencyImpactSource(),
      new BehaviorImpactSource(),
      new ResourceRelationshipImpactSource(),
      new EndpointImpactSource(),
      new DataImpactSource(),
      new IntegrationImpactSource(),
      new TestImpactSource(),
      new ArchitectureImpactSource(),
      new HealthRiskImpactSource(),
    ];
  }

  public async generateCandidates(context: ImpactContext): Promise<ImpactCandidate[]> {
    const allCandidates: ImpactCandidate[] = [];

    for (const source of this.sources) {
      try {
        const candidates = await source.detectImpacts(context);
        allCandidates.push(...candidates);
      } catch (err) {
        console.warn(`[ImpactCandidateGenerator] Source ${source.name} error:`, err);
      }
    }

    return allCandidates;
  }
}
