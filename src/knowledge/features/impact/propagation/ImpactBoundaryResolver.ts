import type { ImpactNode } from '../models/ImpactNode.js';
import type { FeatureRelationship } from '../../dependencies/models/FeatureRelationship.js';
import type { ImpactContext } from '../interfaces/IImpactSource.js';

export interface BoundaryDecision {
  allow: boolean;
  stopReason?: string;
  divertToImpactType?: 'VERIFICATION' | 'ARCHITECTURAL' | 'INTEGRATION';
}

export class ImpactBoundaryResolver {
  /**
   * Determine if propagation across a relationship or between two nodes should be stopped or diverted.
   */
  public static evaluateBoundary(
    sourceNode: ImpactNode,
    targetNode: ImpactNode,
    relationshipType: string,
    context: ImpactContext
  ): BoundaryDecision {
    // 1. Documentation Boundary: Documentation never propagates implementation impact!
    if (
      sourceNode.resourceType === 'DOCUMENTATION' ||
      targetNode.resourceType === 'DOCUMENTATION' ||
      sourceNode.resourceId.endsWith('.md') ||
      targetNode.resourceId.endsWith('.md') ||
      /readme|doc|documentation/i.test(sourceNode.resourceId) ||
      /readme|doc|documentation/i.test(targetNode.resourceId)
    ) {
      return {
        allow: false,
        stopReason: 'DOCUMENTATION_BOUNDARY: Documentation changes do not propagate implementation impact.',
      };
    }

    // 2. Test Boundary: Test relationships produce VERIFICATION impact, never implementation impact
    if (
      sourceNode.resourceType === 'TEST' ||
      targetNode.resourceType === 'TEST' ||
      /\.test\.|\.spec\.|__tests__/i.test(sourceNode.resourceId) ||
      /\.test\.|\.spec\.|__tests__/i.test(targetNode.resourceId) ||
      relationshipType === 'VERIFIES'
    ) {
      return {
        allow: true,
        divertToImpactType: 'VERIFICATION',
        stopReason: 'TEST_BOUNDARY: Diverted to VERIFICATION impact.',
      };
    }

    // 3. Repository / Workspace boundary isolation (Section 53)
    if (sourceNode.metadata?.repositoryId && targetNode.metadata?.repositoryId) {
      if (sourceNode.metadata.repositoryId !== targetNode.metadata.repositoryId) {
        // Only allow if explicit external integration
        if (relationshipType !== 'INTEGRATES_WITH') {
          return {
            allow: false,
            stopReason: 'REPOSITORY_BOUNDARY: Cross-repository traversal blocked without explicit external integration.',
          };
        }
      }
    }

    // 4. Observability / Logging Boundary
    if (relationshipType === 'OBSERVES') {
      return {
        allow: false,
        stopReason: 'OBSERVABILITY_BOUNDARY: Observability relations do not transmit functional change impact.',
      };
    }

    return { allow: true };
  }

  /**
   * Filters relationships that are allowed to transmit change impact.
   */
  public static filterAllowedRelationships(
    relationships: FeatureRelationship[],
    context: ImpactContext
  ): FeatureRelationship[] {
    const allowedTypes = new Set(context.config.allowedRelationshipTypes);

    return relationships.filter((rel) => {
      if (!rel.active) return false;
      if (!allowedTypes.has(rel.relationshipType)) return false;

      // Disallow pure documentation or observability relationships
      if (rel.relationshipType === 'OBSERVES') return false;

      return true;
    });
  }
}
