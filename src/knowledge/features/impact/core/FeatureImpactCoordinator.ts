import type { ImpactContext, ImpactAnalysisOptions } from '../interfaces/IImpactSource.js';
import { DEFAULT_IMPACT_CONFIGURATION } from '../interfaces/IImpactSource.js';
import type { ChangeImpact } from '../models/ChangeImpact.js';
import type { Feature } from '../../models/Feature.js';
import type { FeatureResourceMapping } from '../../mapping/models/FeatureResourceMapping.js';
import type { FeatureRelationship } from '../../dependencies/models/FeatureRelationship.js';
import type { FeatureBehavior } from '../../behavior/models/FeatureBehavior.js';
import type { FeatureHealth } from '../../health/models/FeatureHealth.js';

export interface CoordinatorDependencies {
  features?: Map<string, Feature> | Feature[];
  mappings?: FeatureResourceMapping[];
  relationships?: FeatureRelationship[];
  behaviors?: Map<string, FeatureBehavior> | FeatureBehavior[];
  health?: Map<string, FeatureHealth> | FeatureHealth[];
  featureRepository?: any;
  mappingRepository?: any;
  dependencyEngine?: any;
  behaviorRepository?: any;
  healthRepository?: any;
}

export class FeatureImpactCoordinator {
  private deps: CoordinatorDependencies;

  constructor(dependencies: CoordinatorDependencies = {}) {
    this.deps = dependencies;
  }

  public async buildContext(
    changes: ChangeImpact[],
    options: ImpactAnalysisOptions = {}
  ): Promise<ImpactContext> {
    const config = {
      ...DEFAULT_IMPACT_CONFIGURATION,
      ...(options.config || {}),
    };

    // 1. Features
    const featuresMap = new Map<string, Feature>();
    if (this.deps.features) {
      if (this.deps.features instanceof Map) {
        for (const [k, v] of this.deps.features.entries()) featuresMap.set(k, v);
      } else if (Array.isArray(this.deps.features)) {
        for (const f of this.deps.features) {
          const fid = (f as any).featureId || f.id;
          featuresMap.set(fid, f);
        }
      }
    } else if (this.deps.featureRepository?.getAll) {
      try {
        const list = await this.deps.featureRepository.getAll();
        for (const f of list) {
          const fid = (f as any).featureId || f.id;
          featuresMap.set(fid, f);
        }
      } catch (err) {
        console.warn('[FeatureImpactCoordinator] Error loading features:', err);
      }
    }

    // 2. Mappings
    let mappings: FeatureResourceMapping[] = [];
    if (this.deps.mappings) {
      mappings = this.deps.mappings;
    } else if (this.deps.mappingRepository?.getAllMappings) {
      try {
        mappings = await this.deps.mappingRepository.getAllMappings();
      } catch (err) {
        console.warn('[FeatureImpactCoordinator] Error loading mappings:', err);
      }
    }

    // 3. Relationships
    let relationships: FeatureRelationship[] = [];
    if (this.deps.relationships) {
      relationships = this.deps.relationships;
    } else if (this.deps.dependencyEngine?.getAllRelationships) {
      try {
        relationships = await this.deps.dependencyEngine.getAllRelationships();
      } catch (err) {
        console.warn('[FeatureImpactCoordinator] Error loading relationships:', err);
      }
    }

    // 4. Behaviors
    const behaviorsMap = new Map<string, FeatureBehavior>();
    if (this.deps.behaviors) {
      if (this.deps.behaviors instanceof Map) {
        for (const [k, v] of this.deps.behaviors.entries()) behaviorsMap.set(k, v);
      } else if (Array.isArray(this.deps.behaviors)) {
        for (const b of this.deps.behaviors) behaviorsMap.set(b.featureId, b);
      }
    } else if (this.deps.behaviorRepository?.getAllBehaviors) {
      try {
        const bList = await this.deps.behaviorRepository.getAllBehaviors();
        for (const b of bList) {
          behaviorsMap.set(b.featureId, b);
        }
      } catch (err) {
        console.warn('[FeatureImpactCoordinator] Error loading behaviors:', err);
      }
    }

    // 5. Health
    const healthMap = new Map<string, FeatureHealth>();
    if (this.deps.health) {
      if (this.deps.health instanceof Map) {
        for (const [k, v] of this.deps.health.entries()) healthMap.set(k, v);
      } else if (Array.isArray(this.deps.health)) {
        for (const h of this.deps.health) healthMap.set(h.featureId, h);
      }
    } else if (this.deps.healthRepository?.getAll) {
      try {
        const hList = await this.deps.healthRepository.getAll();
        for (const h of hList) healthMap.set(h.featureId, h);
      } catch (err) {
        console.warn('[FeatureImpactCoordinator] Error loading health:', err);
      }
    }

    return {
      repositoryId: options.repositoryId || 'repo_default',
      workspaceId: options.workspaceId || 'workspace_default',
      changes,
      features: featuresMap,
      mappings,
      relationships,
      behaviors: behaviorsMap,
      health: healthMap,
      config,
      options,
    };
  }
}
