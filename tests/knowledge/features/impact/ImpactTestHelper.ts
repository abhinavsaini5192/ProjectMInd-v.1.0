import { createDefaultFeature } from '../../../../src/knowledge/features/models/Feature.js';
import type { Feature } from '../../../../src/knowledge/features/models/Feature.js';
import type { FeatureResourceMapping } from '../../../../src/knowledge/features/mapping/models/FeatureResourceMapping.js';
import type { MappingResourceType } from '../../../../src/knowledge/features/mapping/models/MappingResourceType.js';
import type { MappingRole } from '../../../../src/knowledge/features/mapping/models/MappingRole.js';
import type { FeatureRelationship } from '../../../../src/knowledge/features/dependencies/models/FeatureRelationship.js';
import type { FeatureBehavior } from '../../../../src/knowledge/features/behavior/models/FeatureBehavior.js';
import type { FeatureFlow } from '../../../../src/knowledge/features/behavior/models/FeatureFlow.js';
import type { FeatureHealth } from '../../../../src/knowledge/features/health/models/FeatureHealth.js';
import type { ChangeImpact } from '../../../../src/knowledge/features/impact/models/ChangeImpact.js';
import type { ChangeTarget } from '../../../../src/knowledge/features/impact/models/ChangeTarget.js';
import type { ChangeType } from '../../../../src/knowledge/features/impact/models/ChangeType.js';
import type { ImpactContext } from '../../../../src/knowledge/features/impact/interfaces/IImpactSource.js';
import { DEFAULT_IMPACT_CONFIGURATION } from '../../../../src/knowledge/features/impact/interfaces/IImpactSource.js';

export class ImpactTestHelper {
  public static createFeature(
    id: string,
    name: string,
    options?: {
      description?: string;
      type?: any;
      metadata?: Record<string, unknown>;
    }
  ): Feature {
    const f = createDefaultFeature(
      id,
      name,
      { workspaceId: 'ws_test', repositoryId: 'repo_test' },
      {
        description: options?.description || `Description for ${name}`,
        type: options?.type || 'USER_FACING',
      }
    );
    (f as any).featureId = id;
    if (options?.metadata) {
      f.metadata = { ...f.metadata, ...options.metadata };
    }
    return f;
  }

  public static createMapping(
    featureId: string,
    resourceId: string,
    resourceType: MappingResourceType = 'FILE',
    role: MappingRole = 'IMPLEMENTATION',
    metadata: Record<string, unknown> = {}
  ): FeatureResourceMapping {
    return {
      mappingId: `map_${featureId}_${resourceId.replace(/[^a-zA-Z0-9]/g, '_')}`,
      featureId,
      resourceId,
      resourceType,
      role,
      confidence: 'HIGH',
      score: 90,
      evidence: [],
      source: 'CODE_STRUCTURE',
      scope: 'FEATURE',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      knowledgeVersion: '1.0.0',
      mappingVersion: 1,
      active: true,
      ...metadata,
    } as unknown as FeatureResourceMapping;
  }

  public static createRelationship(
    sourceFeatureId: string,
    targetFeatureId: string,
    relationshipType: any = 'DEPENDS_ON',
    score: number = 85
  ): FeatureRelationship {
    return {
      relationshipId: `rel_${sourceFeatureId}_${targetFeatureId}_${relationshipType}`,
      sourceFeatureId,
      targetFeatureId,
      relationshipType,
      direction: 'OUTGOING',
      confidence: 'HIGH',
      score,
      evidence: [],
      source: 'DISCOVERED',
      scope: 'FEATURE',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      knowledgeVersion: '1.0.0',
      relationshipVersion: 1,
      active: true,
    } as unknown as FeatureRelationship;
  }

  public static createBehavior(
    featureId: string,
    flows: FeatureFlow[] = []
  ): FeatureBehavior {
    return {
      behaviorId: `beh_${featureId}`,
      featureId,
      flows,
      entryPoints: [],
      primaryFlows: flows,
      alternativeFlows: [],
      failureFlows: [],
      confidence: 'HIGH',
      evidence: [],
      active: true,
      behaviorVersion: 1,
      knowledgeVersion: '1.0.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as unknown as FeatureBehavior;
  }

  public static createFlow(
    flowId: string,
    featureId: string,
    name: string,
    nodes: any[] = [],
    metadata: Record<string, any> = {}
  ): FeatureFlow {
    return {
      flowId,
      featureId,
      name,
      flowType: 'DATA_FLOW',
      direction: 'FORWARD',
      nodes,
      edges: [],
      exitNodeIds: [],
      confidence: 0.9,
      evidence: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata,
    } as unknown as FeatureFlow;
  }

  public static createChange(
    targetId: string,
    targetType: any = 'SYMBOL',
    changeType: ChangeType = 'MODIFIED',
    extra?: Partial<ChangeTarget>
  ): ChangeImpact {
    return {
      changeId: `chg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      target: {
        targetId,
        targetType,
        name: extra?.name || targetId,
        filePath: extra?.filePath,
        symbolName: extra?.symbolName,
        featureId: extra?.featureId,
        metadata: extra?.metadata,
      },
      changeType,
      timestamp: Date.now(),
    };
  }

  public static createContext(params: {
    changes: ChangeImpact[];
    features?: Feature[];
    mappings?: FeatureResourceMapping[];
    relationships?: FeatureRelationship[];
    behaviors?: FeatureBehavior[];
    health?: FeatureHealth[];
  }): ImpactContext {
    const featuresMap = new Map<string, Feature>();
    for (const f of params.features || []) {
      const fid = (f as any).featureId || f.id;
      featuresMap.set(fid, f);
    }

    const behaviorsMap = new Map<string, FeatureBehavior>();
    for (const b of params.behaviors || []) {
      behaviorsMap.set(b.featureId, b);
    }

    const healthMap = new Map<string, FeatureHealth>();
    for (const h of params.health || []) {
      healthMap.set(h.featureId, h);
    }

    return {
      repositoryId: 'repo_test',
      workspaceId: 'ws_test',
      changes: params.changes,
      features: featuresMap,
      mappings: params.mappings || [],
      relationships: params.relationships || [],
      behaviors: behaviorsMap,
      health: healthMap,
      config: DEFAULT_IMPACT_CONFIGURATION,
      options: {},
    };
  }
}
