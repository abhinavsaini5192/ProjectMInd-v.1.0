import { DependencyRegistry } from '../../dependencies/core/DependencyRegistry';
import { FeatureRegistry } from './FeatureRegistry';
import { FeatureOwnershipAnalyzer } from './FeatureOwnershipAnalyzer';
import { ArchitectureViolation, ViolationSeverity } from '../../dependencies/models/ArchitectureViolation';
import { FeatureBoundary } from '../models/FeatureBoundary';

export class FeatureBoundaryAnalyzer {
  constructor(
    private depRegistry: DependencyRegistry,
    private featRegistry: FeatureRegistry,
    private ownership: FeatureOwnershipAnalyzer
  ) {}

  public detectBoundaryViolations(boundaryDef: FeatureBoundary): ArchitectureViolation[] {
    const feature: any = (this.featRegistry as any).getSync ? (this.featRegistry as any).getSync(boundaryDef.featureId) : this.featRegistry.get(boundaryDef.featureId);
    if (!feature) return [];

    const violations: ArchitectureViolation[] = [];
    const symbolIds = feature.symbolIds || (feature.references?.filter((r: any) => r.resourceType === 'SYMBOL').map((r: any) => r.resourceId) || []);

    // Check all dependencies of this feature's symbols
    for (const symId of symbolIds) {
      const outEdges = this.depRegistry.getOutEdges(symId);
      for (const edgeId of outEdges) {
        const dep = this.depRegistry.getDependency(edgeId)!;
        const targetOwnership = this.ownership.resolveOwnership(dep.targetId);
        
        // If the target belongs to a feature not in our allowed outbound list, it's a boundary bleed
        if (targetOwnership.primaryFeatureId !== 'Unknown' && targetOwnership.primaryFeatureId !== feature.id) {
          if (!boundaryDef.allowedOutboundFeatureIds.includes(targetOwnership.primaryFeatureId)) {
             violations.push({
               id: `boundary_violation_${feature.id}_${targetOwnership.primaryFeatureId}`,
               ruleName: 'StrictFeatureBoundary',
               type: 'FeatureBoundaryBleed',
               severity: ViolationSeverity.High,
               path: [symId, dep.targetId],
               description: `Symbol in Feature [${feature.name}] illegally depends on Symbol in Feature [${targetOwnership.primaryFeatureId}]`
             });
          }
        }
      }
    }

    return violations;
  }
}
