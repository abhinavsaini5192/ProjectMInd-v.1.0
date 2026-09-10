import type { ImpactSource } from '../models/ImpactSource.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import type { ChangeImpact } from '../models/ChangeImpact.js';
import type { Feature } from '../../models/Feature.js';
import type { FeatureResourceMapping } from '../../mapping/models/FeatureResourceMapping.js';
import type { FeatureRelationship } from '../../dependencies/models/FeatureRelationship.js';
import type { FeatureBehavior } from '../../behavior/models/FeatureBehavior.js';
import type { FeatureHealth } from '../../health/models/FeatureHealth.js';

export interface ImpactConfiguration {
  maxPropagationDepth: number;
  minConfidenceThreshold: number;
  enableHealthPrioritization: boolean;
  enableBehavioralPropagation: boolean;
  enableDataPropagation: boolean;
  enableApiPropagation: boolean;
  enableIntegrationPropagation: boolean;
  enableVerificationPropagation: boolean;
  enableArchitecturePropagation: boolean;
  allowedRelationshipTypes: string[];
}

export const DEFAULT_IMPACT_CONFIGURATION: ImpactConfiguration = {
  maxPropagationDepth: 5,
  minConfidenceThreshold: 0.2,
  enableHealthPrioritization: true,
  enableBehavioralPropagation: true,
  enableDataPropagation: true,
  enableApiPropagation: true,
  enableIntegrationPropagation: true,
  enableVerificationPropagation: true,
  enableArchitecturePropagation: true,
  allowedRelationshipTypes: [
    'DEPENDS_ON',
    'REQUIRED_BY',
    'PROVIDES',
    'CONSUMES',
    'USES',
    'INTEGRATES_WITH',
    'EXTENDS',
    'SPECIALIZES',
    'COMPOSES',
    'COORDINATES',
    'SHARES_RESOURCE',
    'SHARES_DATA',
    'AUTHORIZES',
    'TRIGGERS',
    'FEEDS',
    'OBSERVES',
    'VERIFIES',
    'ASSOCIATED_WITH',
  ],
};

export interface ImpactAnalysisOptions {
  repositoryId?: string | undefined;
  workspaceId?: string | undefined;
  config?: Partial<ImpactConfiguration> | undefined;
  maxDepth?: number | undefined;
  filterSeverity?: string[] | undefined;
  includeResourceImpacts?: boolean | undefined;
  analysisMode?: 'FULL' | 'INCREMENTAL' | undefined;
  sourceChangeVersion?: string | undefined;
}

export interface ImpactContext {
  repositoryId: string;
  workspaceId: string;
  changes: ChangeImpact[];
  features: Map<string, Feature>;
  mappings: FeatureResourceMapping[];
  relationships: FeatureRelationship[];
  behaviors: Map<string, FeatureBehavior>;
  health: Map<string, FeatureHealth>;
  config: ImpactConfiguration;
  options: ImpactAnalysisOptions;
}

export interface IImpactSource {
  readonly name: ImpactSource;
  detectImpacts(context: ImpactContext): Promise<ImpactCandidate[]>;
}
