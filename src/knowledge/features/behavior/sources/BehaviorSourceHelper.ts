import { SecuritySanitizer } from '../../../../intelligence/agent/hardening/SecuritySanitizer';
import type { FeatureResourceMapping } from '../../mapping/models/FeatureResourceMapping';
import type { MappingResourceType } from '../../mapping/models/MappingResourceType';
import type { FeatureId } from '../../models/FeatureId';
import type { BehaviorContext } from '../interfaces/IFeatureBehaviorSource';
import type { FeatureBehaviorCandidate } from '../models/FeatureBehaviorCandidate';
import type { FeatureBehaviorEvidence } from '../models/FeatureBehaviorEvidence';
import type { FeatureFlowEdge, FeatureFlowRelationType } from '../models/FeatureFlowEdge';
import type { FeatureFlowNode, FeatureFlowNodeMetadata } from '../models/FeatureFlowNode';
import type { FeatureFlowStep } from '../models/FeatureFlowStep';
import type { FeatureFlowType } from '../models/FeatureFlowType';

export class BehaviorSourceHelper {
  private static counter = 0;

  public static generateId(prefix: string): string {
    this.counter += 1;
    const rand = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${Date.now()}_${this.counter}_${rand}`;
  }

  public static sanitize(text: string): string {
    if (!text) return '';
    try {
      const check = SecuritySanitizer.checkPromptInjection(text, false);
      if (check.detected) {
        return `[UNTRUSTED_INJECTION_FILTERED]`;
      }
    } catch {
      // fallback
    }
    return SecuritySanitizer.redactSecrets(text);
  }

  public static sanitizeObject<T>(obj: T): T {
    if (!obj || typeof obj !== 'object') {
      if (typeof obj === 'string') {
        return this.sanitize(obj) as unknown as T;
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item)) as unknown as T;
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = this.sanitizeObject(value);
    }
    return sanitized as T;
  }

  public static createEvidence(
    sourceType: string,
    sourceId: string,
    evidenceType: string,
    description: string,
    strength: number = 0.8,
    metadata: Record<string, any> = {}
  ): FeatureBehaviorEvidence {
    return {
      evidenceId: this.generateId('ev'),
      sourceType,
      sourceId: this.sanitize(sourceId),
      evidenceType,
      description: this.sanitize(description),
      strength: Math.max(0, Math.min(1, strength)),
      confidence: Math.max(0, Math.min(1, strength)),
      metadata: this.sanitizeObject(metadata),
      timestamp: Date.now(),
    };
  }

  public static createNode(
    resourceId: string,
    resourceType: MappingResourceType,
    stepType: FeatureFlowStep,
    label: string,
    metadata: FeatureFlowNodeMetadata = {},
    confidence: number = 0.8
  ): FeatureFlowNode {
    return {
      nodeId: this.generateId('node'),
      resourceId: this.sanitize(resourceId),
      resourceType,
      stepType,
      label: this.sanitize(label),
      metadata: this.sanitizeObject(metadata),
      confidence: Math.max(0, Math.min(1, confidence)),
    };
  }

  public static createEdge(
    sourceNodeId: string,
    targetNodeId: string,
    relationType: FeatureFlowRelationType,
    asynchronous: boolean = false,
    condition?: string,
    confidence: number = 0.8,
    evidence: FeatureBehaviorEvidence[] = [],
    metadata: Record<string, any> = {}
  ): FeatureFlowEdge {
    return {
      edgeId: this.generateId('edge'),
      sourceNodeId,
      targetNodeId,
      relationType,
      condition: condition ? this.sanitize(condition) : undefined,
      asynchronous,
      confidence: Math.max(0, Math.min(1, confidence)),
      evidence,
      metadata: this.sanitizeObject(metadata),
    };
  }

  public static createCandidate(
    featureId: FeatureId,
    name: string,
    flowType: FeatureFlowType,
    nodes: FeatureFlowNode[],
    edges: FeatureFlowEdge[],
    evidence: FeatureBehaviorEvidence[],
    sourceId: string,
    confidence: number = 0.8,
    metadata: Record<string, any> = {}
  ): FeatureBehaviorCandidate {
    return {
      candidateId: this.generateId('cand'),
      featureId,
      name: this.sanitize(name),
      flowType,
      nodes,
      edges,
      evidence,
      score: confidence,
      confidence,
      sources: [sourceId],
      conflicts: [],
      status: 'DETECTED',
      metadata: this.sanitizeObject(metadata),
      createdAt: Date.now(),
    };
  }

  public static getMappedResourcesByType(
    mappings: FeatureResourceMapping[],
    resourceType: MappingResourceType
  ): FeatureResourceMapping[] {
    return mappings.filter(m => m.active !== false && m.resourceType === resourceType);
  }

  public static resolveFeatureBoundary(
    targetResourceId: string,
    currentFeatureId: FeatureId,
    context: BehaviorContext
  ): { isBoundary: boolean; targetFeatureId?: string } {
    if (!targetResourceId) return { isBoundary: false };

    // 1. Check relationships from Phase 6.4
    if (context.relationships) {
      for (const rel of context.relationships) {
        if (rel.sourceFeatureId === currentFeatureId && rel.targetFeatureId !== currentFeatureId) {
          const evidenceStr = JSON.stringify(rel.evidence || {});
          if (evidenceStr.includes(targetResourceId)) {
            return { isBoundary: true, targetFeatureId: rel.targetFeatureId };
          }
        }
      }
    }

    // 2. Check allMappings if available
    if (context.allMappings) {
      if (context.allMappings instanceof Map) {
        for (const [featId, mappings] of context.allMappings.entries()) {
          if (featId !== currentFeatureId && mappings.some(m => m.resourceId === targetResourceId)) {
            return { isBoundary: true, targetFeatureId: featId };
          }
        }
      } else if (Array.isArray(context.allMappings)) {
        for (const m of context.allMappings) {
          if (m.resourceId === targetResourceId && m.featureId !== currentFeatureId) {
            return { isBoundary: true, targetFeatureId: m.featureId };
          }
        }
      }
    }

    // 3. Check allFeatures references
    if (context.allFeatures) {
      for (const feat of context.allFeatures) {
        if (feat.id !== currentFeatureId && feat.references) {
          if (feat.references.some(r => r.resourceId === targetResourceId)) {
            return { isBoundary: true, targetFeatureId: feat.id };
          }
        }
      }
    }

    return { isBoundary: false };
  }
}
