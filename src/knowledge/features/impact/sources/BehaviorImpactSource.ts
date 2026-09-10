import type { IImpactSource, ImpactContext } from '../interfaces/IImpactSource.js';
import type { ImpactCandidate } from '../models/ImpactCandidate.js';
import { ChangeSourceHelper } from './ChangeSource.js';

export class BehaviorImpactSource implements IImpactSource {
  public readonly name = 'BEHAVIOR' as const;

  public async detectImpacts(context: ImpactContext): Promise<ImpactCandidate[]> {
    const candidates: ImpactCandidate[] = [];

    if (!context.config.enableBehavioralPropagation || !context.behaviors) {
      return candidates;
    }

    for (const change of context.changes) {
      const target = change.target;
      const targetIds = [target.targetId];
      if (target.symbolName) targetIds.push(target.symbolName);
      if (target.filePath) targetIds.push(target.filePath);

      for (const [featureId, behavior] of context.behaviors.entries()) {
        const flows = behavior.flows || [];

        for (const flow of flows) {
          let stepIndex = -1;
          for (let i = 0; i < flow.nodes.length; i++) {
            const node = flow.nodes[i];
            if (!node) continue;
            const matches =
              targetIds.includes(node.resourceId) ||
              (target.symbolName && node.label.includes(target.symbolName)) ||
              (target.name && node.label.includes(target.name));

            if (matches) {
              stepIndex = i;
              break;
            }
          }

          if (stepIndex >= 0) {
            const affectedNode = flow.nodes[stepIndex]!;
            const downstreamNodes = flow.nodes.slice(stepIndex + 1);

            // 1. Direct behavioral impact on owning feature
            const evidence = ChangeSourceHelper.createEvidence({
              source: 'BEHAVIOR',
              sourceId: flow.flowId,
              evidenceType: 'FLOW_NODE_MODIFICATION',
              description: `Changed resource "${target.name || target.targetId}" participates in flow "${flow.name}" (step ${stepIndex + 1}/${flow.nodes.length}) of feature "${featureId}".`,
              confidence: flow.confidence || 0.9,
              metadata: {
                flowId: flow.flowId,
                flowName: flow.name,
                stepType: affectedNode.stepType,
                downstreamStepsCount: downstreamNodes.length,
              },
            });

            candidates.push(
              ChangeSourceHelper.createCandidate({
                sourceChangeId: change.changeId,
                targetFeatureId: featureId,
                targetResourceId: affectedNode.resourceId,
                targetResourceType: affectedNode.resourceType,
                impactType: 'BEHAVIORAL',
                scope: 'FEATURE',
                direction: 'DOWNSTREAM',
                confidence: 'HIGH',
                severity: 'MEDIUM',
                direct: true,
                distance: 0,
                evidence: [evidence],
                contributingChanges: [target],
              })
            );

            // 2. Check for cross-boundary features in downstream nodes
            for (const dn of downstreamNodes) {
              const boundaryFeatureId =
                dn.metadata?.targetFeatureId ||
                (dn.metadata?.featureBoundary ? dn.metadata?.sourceFeatureId : undefined);

              if (boundaryFeatureId && boundaryFeatureId !== featureId) {
                const boundaryEvidence = ChangeSourceHelper.createEvidence({
                  source: 'BEHAVIOR',
                  sourceId: dn.nodeId,
                  evidenceType: 'BEHAVIORAL_CROSS_BOUNDARY',
                  description: `Flow "${flow.name}" crosses boundary into feature "${boundaryFeatureId}" via node "${dn.label}".`,
                  confidence: 0.85,
                  metadata: {
                    sourceFeatureId: featureId,
                    targetFeatureId: boundaryFeatureId,
                    flowId: flow.flowId,
                  },
                });

                candidates.push(
                  ChangeSourceHelper.createCandidate({
                    sourceChangeId: change.changeId,
                    targetFeatureId: boundaryFeatureId,
                    targetResourceId: dn.resourceId,
                    targetResourceType: dn.resourceType,
                    impactType: 'BEHAVIORAL',
                    scope: 'FEATURE',
                    direction: 'DOWNSTREAM',
                    confidence: 'HIGH',
                    severity: 'MEDIUM',
                    direct: false,
                    distance: 1,
                    evidence: [boundaryEvidence],
                    contributingChanges: [target],
                  })
                );
              }
            }
          }
        }
      }
    }

    return candidates;
  }
}
