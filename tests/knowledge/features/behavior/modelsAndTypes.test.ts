import { describe, it, expect } from 'vitest';
import {
  VALID_FEATURE_FLOW_STEPS,
  isValidFeatureFlowStep,
} from '../../../../src/knowledge/features/behavior/models/FeatureFlowStep';
import {
  VALID_FEATURE_FLOW_TYPES,
  isValidFeatureFlowType,
} from '../../../../src/knowledge/features/behavior/models/FeatureFlowType';
import {
  VALID_FEATURE_FLOW_RELATION_TYPES,
  isValidFeatureFlowRelationType,
} from '../../../../src/knowledge/features/behavior/models/FeatureFlowEdge';
import {
  scoreToFeatureBehaviorConfidenceLevel,
} from '../../../../src/knowledge/features/behavior/models/FeatureBehaviorConfidence';
import type { FeatureFlowNode } from '../../../../src/knowledge/features/behavior/models/FeatureFlowNode';
import type { FeatureFlowEdge } from '../../../../src/knowledge/features/behavior/models/FeatureFlowEdge';
import type { FeatureFlow } from '../../../../src/knowledge/features/behavior/models/FeatureFlow';
import type { FeatureBehavior } from '../../../../src/knowledge/features/behavior/models/FeatureBehavior';

describe('Phase 6.5: Models & Types', () => {
  it('should define all 18 discrete behavioral step types', () => {
    expect(VALID_FEATURE_FLOW_STEPS).toContain('ENTRY_POINT');
    expect(VALID_FEATURE_FLOW_STEPS).toContain('VALIDATION');
    expect(VALID_FEATURE_FLOW_STEPS).toContain('AUTHORIZATION');
    expect(VALID_FEATURE_FLOW_STEPS).toContain('CONTROLLER');
    expect(VALID_FEATURE_FLOW_STEPS).toContain('HANDLER');
    expect(VALID_FEATURE_FLOW_STEPS).toContain('SERVICE');
    expect(VALID_FEATURE_FLOW_STEPS).toContain('FUNCTION');
    expect(VALID_FEATURE_FLOW_STEPS).toContain('REPOSITORY');
    expect(VALID_FEATURE_FLOW_STEPS).toContain('DATABASE');
    expect(VALID_FEATURE_FLOW_STEPS).toContain('CACHE');
    expect(VALID_FEATURE_FLOW_STEPS).toContain('EVENT');
    expect(VALID_FEATURE_FLOW_STEPS).toContain('QUEUE');
    expect(VALID_FEATURE_FLOW_STEPS).toContain('EXTERNAL_SERVICE');
    expect(VALID_FEATURE_FLOW_STEPS).toContain('TRANSFORMATION');
    expect(VALID_FEATURE_FLOW_STEPS).toContain('CONDITION');
    expect(VALID_FEATURE_FLOW_STEPS).toContain('ERROR_HANDLER');
    expect(VALID_FEATURE_FLOW_STEPS).toContain('RESPONSE');
    expect(VALID_FEATURE_FLOW_STEPS).toContain('EXIT');
    expect(VALID_FEATURE_FLOW_STEPS.length).toBe(18);

    expect(isValidFeatureFlowStep('ENTRY_POINT')).toBe(true);
    expect(isValidFeatureFlowStep('INVALID_STEP')).toBe(false);
  });

  it('should define all 12 behavioral flow types', () => {
    expect(VALID_FEATURE_FLOW_TYPES).toContain('PRIMARY');
    expect(VALID_FEATURE_FLOW_TYPES).toContain('ALTERNATIVE');
    expect(VALID_FEATURE_FLOW_TYPES).toContain('FAILURE');
    expect(VALID_FEATURE_FLOW_TYPES).toContain('VALIDATION');
    expect(VALID_FEATURE_FLOW_TYPES).toContain('AUTHORIZATION');
    expect(VALID_FEATURE_FLOW_TYPES).toContain('DATA');
    expect(VALID_FEATURE_FLOW_TYPES).toContain('API');
    expect(VALID_FEATURE_FLOW_TYPES).toContain('EVENT');
    expect(VALID_FEATURE_FLOW_TYPES).toContain('ASYNC');
    expect(VALID_FEATURE_FLOW_TYPES).toContain('INTEGRATION');
    expect(VALID_FEATURE_FLOW_TYPES).toContain('TRANSACTION');
    expect(VALID_FEATURE_FLOW_TYPES).toContain('OBSERVABILITY');
    expect(VALID_FEATURE_FLOW_TYPES.length).toBe(12);

    expect(isValidFeatureFlowType('PRIMARY')).toBe(true);
    expect(isValidFeatureFlowType('UNKNOWN_FLOW')).toBe(false);
  });

  it('should define all 13 relation types', () => {
    expect(VALID_FEATURE_FLOW_RELATION_TYPES).toContain('CALLS');
    expect(VALID_FEATURE_FLOW_RELATION_TYPES).toContain('READS');
    expect(VALID_FEATURE_FLOW_RELATION_TYPES).toContain('WRITES');
    expect(VALID_FEATURE_FLOW_RELATION_TYPES).toContain('VALIDATES');
    expect(VALID_FEATURE_FLOW_RELATION_TYPES).toContain('AUTHORIZES');
    expect(VALID_FEATURE_FLOW_RELATION_TYPES).toContain('TRANSFORMS');
    expect(VALID_FEATURE_FLOW_RELATION_TYPES).toContain('EMITS');
    expect(VALID_FEATURE_FLOW_RELATION_TYPES).toContain('CONSUMES');
    expect(VALID_FEATURE_FLOW_RELATION_TYPES).toContain('AWAIT');
    expect(VALID_FEATURE_FLOW_RELATION_TYPES).toContain('RETURNS');
    expect(VALID_FEATURE_FLOW_RELATION_TYPES).toContain('FAILS_TO');
    expect(VALID_FEATURE_FLOW_RELATION_TYPES).toContain('REDIRECTS_TO');
    expect(VALID_FEATURE_FLOW_RELATION_TYPES).toContain('TRIGGERS');
    expect(VALID_FEATURE_FLOW_RELATION_TYPES.length).toBe(13);

    expect(isValidFeatureFlowRelationType('CALLS')).toBe(true);
    expect(isValidFeatureFlowRelationType('UNKNOWN_RELATION')).toBe(false);
  });

  it('should correctly calibrate confidence scores into discrete levels', () => {
    expect(scoreToFeatureBehaviorConfidenceLevel(0.95)).toBe('VERY_HIGH');
    expect(scoreToFeatureBehaviorConfidenceLevel(0.90)).toBe('VERY_HIGH');
    expect(scoreToFeatureBehaviorConfidenceLevel(0.85)).toBe('HIGH');
    expect(scoreToFeatureBehaviorConfidenceLevel(0.70)).toBe('HIGH');
    expect(scoreToFeatureBehaviorConfidenceLevel(0.55)).toBe('MEDIUM');
    expect(scoreToFeatureBehaviorConfidenceLevel(0.45)).toBe('MEDIUM');
    expect(scoreToFeatureBehaviorConfidenceLevel(0.25)).toBe('LOW');
    expect(scoreToFeatureBehaviorConfidenceLevel(0.20)).toBe('LOW');
    expect(scoreToFeatureBehaviorConfidenceLevel(0.10)).toBe('VERY_LOW');
  });

  it('should construct valid FeatureFlowNode and FeatureFlowEdge instances', () => {
    const node: FeatureFlowNode = {
      nodeId: 'node_1',
      resourceId: 'src/auth/AuthController.ts',
      resourceType: 'SYMBOL',
      stepType: 'CONTROLLER',
      label: 'AuthController.login',
      metadata: { operation: 'login' },
      confidence: 0.9,
    };

    const edge: FeatureFlowEdge = {
      edgeId: 'edge_1',
      sourceNodeId: 'node_1',
      targetNodeId: 'node_2',
      relationType: 'CALLS',
      asynchronous: false,
      confidence: 0.9,
      evidence: [],
    };

    expect(node.nodeId).toBe('node_1');
    expect(node.stepType).toBe('CONTROLLER');
    expect(edge.relationType).toBe('CALLS');
  });

  it('should construct valid FeatureFlow and FeatureBehavior aggregates', () => {
    const flow: FeatureFlow = {
      flowId: 'flow_login_primary',
      featureId: 'feat_auth_service',
      name: 'Password Login Flow',
      flowType: 'PRIMARY',
      direction: 'FORWARD',
      nodes: [],
      edges: [],
      exitNodeIds: [],
      confidence: 0.92,
      evidence: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const behavior: FeatureBehavior = {
      behaviorId: 'beh_auth',
      featureId: 'feat_auth_service',
      flows: [flow],
      entryPoints: [],
      primaryFlows: [flow],
      alternativeFlows: [],
      failureFlows: [],
      confidence: { level: 'VERY_HIGH', score: 0.92, reasons: ['High evidence'] },
      evidence: [],
      active: true,
      behaviorVersion: 1,
      knowledgeVersion: '6.5.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    expect(behavior.flows.length).toBe(1);
    expect(behavior.primaryFlows.length).toBe(1);
    expect(behavior.confidence.level).toBe('VERY_HIGH');
  });
});
