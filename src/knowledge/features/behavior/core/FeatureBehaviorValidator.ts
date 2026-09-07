import { SecuritySanitizer } from '../../../../intelligence/agent/hardening/SecuritySanitizer';
import type { BehaviorContext } from '../interfaces/IFeatureBehaviorSource';
import type { BehaviorValidationResult, IFeatureBehaviorValidator } from '../interfaces/IFeatureBehaviorValidator';
import type { FeatureBehavior } from '../models/FeatureBehavior';
import type { FeatureFlow } from '../models/FeatureFlow';
import { isValidFeatureFlowRelationType } from '../models/FeatureFlowEdge';
import { isValidFeatureFlowStep } from '../models/FeatureFlowStep';
import { isValidFeatureFlowType } from '../models/FeatureFlowType';

export class FeatureBehaviorValidator implements IFeatureBehaviorValidator {
  public async validateFlow(flow: FeatureFlow, context: BehaviorContext): Promise<BehaviorValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Basic properties
    if (!flow.flowId || typeof flow.flowId !== 'string') {
      errors.push('Flow must have a valid non-empty flowId');
    }
    if (!flow.featureId || flow.featureId !== context.feature.id) {
      errors.push(`Flow featureId "${flow.featureId}" does not match context featureId "${context.feature.id}"`);
    }
    if (!isValidFeatureFlowType(flow.flowType)) {
      errors.push(`Invalid flowType "${flow.flowType}" in flow ${flow.flowId}`);
    }

    // 2. Confidence bounds
    if (typeof flow.confidence !== 'number' || flow.confidence < 0 || flow.confidence > 1) {
      errors.push(`Flow confidence must be between 0 and 1, received: ${flow.confidence}`);
    }

    // 3. Node referential integrity
    const nodeIds = new Set<string>();
    for (const node of flow.nodes) {
      if (!node.nodeId) {
        errors.push('Encountered node without nodeId');
        continue;
      }
      if (nodeIds.has(node.nodeId)) {
        errors.push(`Duplicate nodeId detected in flow: ${node.nodeId}`);
      }
      nodeIds.add(node.nodeId);

      if (!isValidFeatureFlowStep(node.stepType)) {
        errors.push(`Invalid stepType "${node.stepType}" in node ${node.nodeId}`);
      }

      // Security checks on node labels
      if (node.label) {
        try {
          const injection = SecuritySanitizer.checkPromptInjection(node.label, false);
          if (injection.detected) {
            warnings.push(`Potential prompt injection pattern in node label: "${node.label}"`);
          }
        } catch {
          // ignore
        }
      }
    }

    // 4. Edge referential integrity
    for (const edge of flow.edges) {
      if (!nodeIds.has(edge.sourceNodeId)) {
        errors.push(`Edge ${edge.edgeId} references missing sourceNodeId: ${edge.sourceNodeId}`);
      }
      if (!nodeIds.has(edge.targetNodeId)) {
        errors.push(`Edge ${edge.edgeId} references missing targetNodeId: ${edge.targetNodeId}`);
      }
      if (!isValidFeatureFlowRelationType(edge.relationType)) {
        errors.push(`Invalid relationType "${edge.relationType}" in edge ${edge.edgeId}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public async validateBehavior(
    behavior: FeatureBehavior,
    context: BehaviorContext
  ): Promise<BehaviorValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!behavior.behaviorId) {
      errors.push('Behavior must have a valid behaviorId');
    }
    if (behavior.featureId !== context.feature.id) {
      errors.push(`Behavior featureId "${behavior.featureId}" does not match context "${context.feature.id}"`);
    }

    // Validate all individual flows
    for (const flow of behavior.flows) {
      const flowRes = await this.validateFlow(flow, context);
      if (!flowRes.isValid) {
        errors.push(...flowRes.errors);
      }
      warnings.push(...flowRes.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
