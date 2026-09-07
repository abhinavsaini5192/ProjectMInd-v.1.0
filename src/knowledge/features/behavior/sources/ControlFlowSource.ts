import type { BehaviorContext, IFeatureBehaviorSource } from '../interfaces/IFeatureBehaviorSource';
import type { FeatureBehaviorCandidate } from '../models/FeatureBehaviorCandidate';
import { BehaviorSourceHelper } from './BehaviorSourceHelper';

export class ControlFlowSource implements IFeatureBehaviorSource {
  public readonly sourceId = 'CONTROL_FLOW_SOURCE';
  public readonly sourceType = 'LOGICAL';
  public readonly priority = 85;

  public async extractBehavior(context: BehaviorContext): Promise<FeatureBehaviorCandidate[]> {
    const candidates: FeatureBehaviorCandidate[] = [];
    const featureId = context.feature.id;

    // Look for symbols or metadata indicating conditional decisions
    const symbols = BehaviorSourceHelper.getMappedResourcesByType(context.mappings, 'SYMBOL');
    const decisionSymbols = symbols.filter(s => {
      const lower = s.resourceId.toLowerCase();
      return (
        lower.includes('verify') ||
        lower.includes('check') ||
        lower.includes('validate') ||
        lower.includes('isvalid') ||
        lower.includes('haspermission') ||
        lower.includes('authenticate') ||
        lower.includes('authorize') ||
        s.metadata?.hasBranches === true
      );
    });

    for (const sym of decisionSymbols) {
      const ev = BehaviorSourceHelper.createEvidence(
        this.sourceType,
        this.sourceId,
        'CONTROL_BRANCH_DETECTED',
        `Conditional decision detected in ${sym.resourceId}`,
        0.83
      );

      const conditionNode = BehaviorSourceHelper.createNode(
        sym.resourceId,
        'SYMBOL',
        'CONDITION',
        `Decision: ${sym.resourceId} Valid?`,
        {
          operation: 'BRANCH_DECISION',
          conditions: ['true', 'false'],
        },
        0.83
      );

      const successTargetNode = BehaviorSourceHelper.createNode(
        `${sym.resourceId}:success`,
        'SYMBOL',
        'FUNCTION',
        `${sym.resourceId} [Success Branch]`,
        { branch: 'true' },
        0.83
      );

      const failureTargetNode = BehaviorSourceHelper.createNode(
        `${sym.resourceId}:failure`,
        'SYMBOL',
        'ERROR_HANDLER',
        `${sym.resourceId} [Failure Branch]`,
        { branch: 'false' },
        0.83
      );

      const successEdge = BehaviorSourceHelper.createEdge(
        conditionNode.nodeId,
        successTargetNode.nodeId,
        'RETURNS',
        false,
        'condition == true',
        0.85,
        [ev]
      );

      const failureEdge = BehaviorSourceHelper.createEdge(
        conditionNode.nodeId,
        failureTargetNode.nodeId,
        'FAILS_TO',
        false,
        'condition == false',
        0.85,
        [ev]
      );

      candidates.push(
        BehaviorSourceHelper.createCandidate(
          featureId,
          `Decision Flow: ${sym.resourceId}`,
          'ALTERNATIVE',
          [conditionNode, successTargetNode, failureTargetNode],
          [successEdge, failureEdge],
          [ev],
          this.sourceId,
          0.83,
          { hasBranches: true }
        )
      );
    }

    return candidates;
  }
}
