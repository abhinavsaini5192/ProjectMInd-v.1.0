import { createDefaultFeature, type Feature } from '../../../../src/knowledge/features/models/Feature';
import type { FeatureResourceMapping } from '../../../../src/knowledge/features/mapping/models/FeatureResourceMapping';
import type { MappingResourceType } from '../../../../src/knowledge/features/mapping/models/MappingResourceType';
import type { BehaviorContext } from '../../../../src/knowledge/features/behavior/interfaces/IFeatureBehaviorSource';
import { FeatureBehaviorRepository } from '../../../../src/knowledge/features/behavior/repository/FeatureBehaviorRepository';
import { FeatureBehaviorEngine } from '../../../../src/knowledge/features/behavior/core/FeatureBehaviorEngine';

export class BehaviorTestHelper {
  public static createFeature(id: string, name: string, description: string = ''): Feature {
    return createDefaultFeature(
      id,
      name,
      { workspaceId: 'ws_default', repositoryId: 'repo_default' },
      { description }
    );
  }

  public static createMapping(
    featureId: string,
    resourceId: string,
    resourceType: MappingResourceType,
    role: any = 'PRIMARY',
    metadata: Record<string, any> = {}
  ): FeatureResourceMapping {
    return {
      mappingId: `map_${featureId}_${resourceId.replace(/[^a-zA-Z0-9]/g, '_')}`,
      featureId,
      resourceId,
      resourceType,
      role,
      confidence: 0.9,
      score: 0.9,
      evidence: [],
      active: true,
      metadata,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  public static createContext(
    feature: Feature,
    mappings: FeatureResourceMapping[],
    options: Partial<BehaviorContext> = {}
  ): BehaviorContext {
    return {
      feature,
      mappings,
      relationships: options.relationships || [],
      allFeatures: options.allFeatures || [feature],
      allMappings: options.allMappings,
      extraction: options.extraction || {},
      configuration: options.configuration || {},
    };
  }

  public static createEngine(repo?: FeatureBehaviorRepository): {
    engine: FeatureBehaviorEngine;
    repository: FeatureBehaviorRepository;
  } {
    const repository = repo || new FeatureBehaviorRepository();
    const engine = new FeatureBehaviorEngine(repository);
    return { engine, repository };
  }
}
