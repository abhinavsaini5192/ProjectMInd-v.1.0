import type { FeatureBehavior } from '../models/FeatureBehavior';
import type { FeatureFlow } from '../models/FeatureFlow';

export class FeatureBehaviorExplainer {
  /**
   * Produce a comprehensive Markdown narrative explaining the entire feature behavior
   */
  public explainBehavior(behavior: FeatureBehavior, featureName: string): string {
    const lines: string[] = [];

    lines.push(`# Feature Behavior: ${featureName} (${behavior.featureId})`);
    lines.push('');
    lines.push(`- **Confidence**: ${behavior.confidence.level} (${(behavior.confidence.score * 100).toFixed(1)}%)`);
    lines.push(`- **Total Flows**: ${behavior.flows.length}`);
    lines.push(`- **Primary Flows**: ${behavior.primaryFlows.length}`);
    lines.push(`- **Alternative Flows**: ${behavior.alternativeFlows.length}`);
    lines.push(`- **Failure Flows**: ${behavior.failureFlows.length}`);
    lines.push(`- **Active**: ${behavior.active ? 'Yes' : 'No'}`);
    lines.push('');

    // Confidence calibration reasons
    lines.push('### Confidence Rationale');
    for (const reason of behavior.confidence.reasons) {
      lines.push(`- ${reason}`);
    }
    lines.push('');

    // Primary flows
    lines.push('## Primary Execution Paths');
    if (behavior.primaryFlows.length === 0) {
      lines.push('*No primary flows identified.*');
    } else {
      for (const flow of behavior.primaryFlows) {
        lines.push(this.formatFlowSection(flow));
      }
    }
    lines.push('');

    // Alternative flows
    if (behavior.alternativeFlows.length > 0) {
      lines.push('## Alternative Execution Paths');
      for (const flow of behavior.alternativeFlows) {
        lines.push(this.formatFlowSection(flow));
      }
      lines.push('');
    }

    // Failure flows
    if (behavior.failureFlows.length > 0) {
      lines.push('## Failure & Error Recovery Paths');
      for (const flow of behavior.failureFlows) {
        lines.push(this.formatFlowSection(flow));
      }
      lines.push('');
    }

    // Cross-feature boundary transitions
    const boundaryNodes = behavior.flows.flatMap(f =>
      f.nodes.filter(n => n.metadata?.featureBoundary === true)
    );
    if (boundaryNodes.length > 0) {
      lines.push('## Cross-Feature Architectural Boundaries');
      lines.push('| Step | Target Feature | Resource |');
      lines.push('| :--- | :--- | :--- |');
      for (const bn of boundaryNodes) {
        lines.push(`| ${bn.label} | \`${bn.metadata.targetFeatureId}\` | \`${bn.resourceId}\` |`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Explain a single flow
   */
  public explainFlow(flow: FeatureFlow): string {
    return this.formatFlowSection(flow);
  }

  private formatFlowSection(flow: FeatureFlow): string {
    const lines: string[] = [];
    lines.push(`### Flow: ${flow.name}`);
    lines.push(`- **Flow Type**: \`${flow.flowType}\``);
    lines.push(`- **Confidence**: ${(flow.confidence * 100).toFixed(1)}%`);
    lines.push(`- **Steps Count**: ${flow.nodes.length}`);
    lines.push('');

    lines.push('#### Execution Sequence');
    if (flow.nodes.length === 0) {
      lines.push('*No nodes in flow.*');
    } else {
      for (let i = 0; i < flow.nodes.length; i++) {
        const node = flow.nodes[i];
        const boundaryTag = node.metadata?.featureBoundary
          ? ` [-> Boundary to \`${node.metadata.targetFeatureId}\`]`
          : '';
        const asyncTag = node.metadata?.asynchronous ? ' (async)' : '';
        lines.push(`${i + 1}. **[${node.stepType}]** \`${node.label}\`${boundaryTag}${asyncTag}`);
      }
    }
    lines.push('');

    if (flow.edges.length > 0) {
      lines.push('#### Transitions');
      for (const e of flow.edges) {
        const src = flow.nodes.find(n => n.nodeId === e.sourceNodeId)?.label || e.sourceNodeId;
        const tgt = flow.nodes.find(n => n.nodeId === e.targetNodeId)?.label || e.targetNodeId;
        const cond = e.condition ? ` when [${e.condition}]` : '';
        const asyncTag = e.asynchronous ? ' (async)' : '';
        lines.push(`- \`${src}\` --**${e.relationType}**${cond}${asyncTag}--> \`${tgt}\``);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}
