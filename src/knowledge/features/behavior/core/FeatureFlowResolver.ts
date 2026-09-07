import type { BehaviorContext } from '../interfaces/IFeatureBehaviorSource';
import type { FeatureBehaviorConflict } from '../models/FeatureBehaviorConflict';
import type { FeatureFlow } from '../models/FeatureFlow';
import { BehaviorSourceHelper } from '../sources/BehaviorSourceHelper';

export interface ResolvedFlowClassification {
  primaryFlows: FeatureFlow[];
  alternativeFlows: FeatureFlow[];
  failureFlows: FeatureFlow[];
  conflicts: FeatureBehaviorConflict[];
}

export class FeatureFlowResolver {
  public resolveFlows(flows: FeatureFlow[], context: BehaviorContext): ResolvedFlowClassification {
    const primaryFlows: FeatureFlow[] = [];
    const alternativeFlows: FeatureFlow[] = [];
    const failureFlows: FeatureFlow[] = [];
    const conflicts: FeatureBehaviorConflict[] = [];

    // 1. Classification
    for (const flow of flows) {
      const isExplicitFailure = flow.flowType === 'FAILURE';
      const isDedicatedFailureBranch =
        flow.nodes.some(n => n.metadata?.isFailureBranch === true) ||
        (flow.nodes.some(n => n.stepType === 'ERROR_HANDLER') &&
          !flow.nodes.some(n => n.stepType === 'SERVICE' || n.metadata?.branch === 'true'));

      if (isExplicitFailure || isDedicatedFailureBranch) {
        flow.flowType = 'FAILURE';
        failureFlows.push(flow);
      } else if (flow.flowType === 'PRIMARY' || flow.flowType === 'API') {
        // If we already have a primary flow with the exact same entry point, check for contradiction
        const conflictingPrimary = primaryFlows.find(pf => this.haveConflictingEntryOrHandler(pf, flow));
        if (conflictingPrimary) {
          const conflict = this.createConflict(
            context.feature.id,
            [conflictingPrimary.flowId, flow.flowId],
            `Contradictory execution paths discovered for entry route: "${flow.name}" vs "${conflictingPrimary.name}"`,
            'HIGH',
            flow
          );
          conflicts.push(conflict);
          // Demote second one to alternative
          flow.flowType = 'ALTERNATIVE';
          alternativeFlows.push(flow);
        } else {
          primaryFlows.push(flow);
        }
      } else {
        alternativeFlows.push(flow);
      }
    }

    // Ensure at least one primary flow exists if flows are available
    if (primaryFlows.length === 0 && flows.length > 0) {
      const nonFailure = flows.filter(f => !failureFlows.includes(f));
      if (nonFailure.length > 0) {
        primaryFlows.push(nonFailure[0]);
        const idx = alternativeFlows.indexOf(nonFailure[0]);
        if (idx !== -1) alternativeFlows.splice(idx, 1);
      }
    }

    return {
      primaryFlows,
      alternativeFlows,
      failureFlows,
    conflicts,
    };
  }

  private haveConflictingEntryOrHandler(a: FeatureFlow, b: FeatureFlow): boolean {
    const entryA = a.nodes.find(n => n.stepType === 'ENTRY_POINT');
    const entryB = b.nodes.find(n => n.stepType === 'ENTRY_POINT');
    if (!entryA || !entryB) return false;

    // Same route/method
    const routeA = entryA.metadata?.route || entryA.resourceId;
    const routeB = entryB.metadata?.route || entryB.resourceId;
    if (routeA !== routeB) return false;

    // But completely different service/handler target
    const serviceA = a.nodes.find(n => n.stepType === 'SERVICE' || n.stepType === 'CONTROLLER');
    const serviceB = b.nodes.find(n => n.stepType === 'SERVICE' || n.stepType === 'CONTROLLER');
    if (serviceA && serviceB && serviceA.resourceId !== serviceB.resourceId) {
      return true;
    }

    return false;
  }

  private createConflict(
    featureId: string,
    flowIds: string[],
    reason: string,
    severity: 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL',
    flow: FeatureFlow
  ): FeatureBehaviorConflict {
    const ev = BehaviorSourceHelper.createEvidence(
      'CORE',
      'FEATURE_FLOW_RESOLVER',
      'FLOW_CONTRADICTION',
      reason,
      0.9
    );

    return {
      conflictId: BehaviorSourceHelper.generateId('conflict'),
      featureId,
      flowIds,
      reason,
      severity,
      evidence: [ev, ...flow.evidence.slice(0, 2)],
      status: 'OPEN',
      detectedAt: Date.now(),
    };
  }
}
