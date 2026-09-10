import type { IImpactExplainer } from '../interfaces/IImpactExplainer.js';
import type { ChangeImpact } from '../models/ChangeImpact.js';
import type { FeatureImpact } from '../models/FeatureImpact.js';
import type { ResourceImpact } from '../models/ResourceImpact.js';
import type { ImpactPath } from '../models/ImpactPath.js';
import { SecuritySanitizer } from '../../../../intelligence/agent/hardening/SecuritySanitizer.js';

export class ImpactExplainer implements IImpactExplainer {
  public explainChange(
    change: ChangeImpact,
    featureImpacts: FeatureImpact[],
    resourceImpacts: ResourceImpact[],
    paths: ImpactPath[]
  ): string {
    const targetName = change.target.name || change.target.symbolName || change.target.filePath || change.target.targetId;
    const directFeatures = featureImpacts.filter((f) => f.direct);
    const indirectFeatures = featureImpacts.filter((f) => !f.direct);
    const verificationResources = resourceImpacts.filter((r) => r.impactType === 'VERIFICATION');

    const lines: string[] = [
      `# Change Impact Assessment: \`${targetName}\``,
      '',
      `**Change Type**: \`${change.changeType}\` | **Target Type**: \`${change.target.targetType}\``,
      '',
      '## 1. Summary of Affected Features',
      '',
    ];

    if (directFeatures.length === 0 && indirectFeatures.length === 0) {
      lines.push('No features are predicted to be affected based on current knowledge.');
    } else {
      if (directFeatures.length > 0) {
        lines.push('### Directly Affected Features:');
        for (const f of directFeatures) {
          lines.push(`- **${f.targetFeatureId}** (Score: ${f.score}/100, Severity: \`${f.severity}\`, Confidence: \`${f.confidence}\`)`);
          for (const ev of f.evidence) {
            lines.push(`  - ${ev.description}`);
          }
        }
        lines.push('');
      }

      if (indirectFeatures.length > 0) {
        lines.push('### Indirectly Affected Features:');
        for (const f of indirectFeatures) {
          lines.push(`- **${f.targetFeatureId}** (Distance: ${f.distance}, Score: ${f.score}/100, Severity: \`${f.severity}\`, Confidence: \`${f.confidence}\`)`);
          const relevantPath = paths.find((p) => p.targetNode.featureId === f.targetFeatureId);
          if (relevantPath) {
            const chain = relevantPath.nodes.map((n) => n.featureId || n.resourceId).join(' → ');
            lines.push(`  - **Path**: \`${chain}\``);
          }
          for (const ev of f.evidence.slice(0, 2)) {
            lines.push(`  - ${ev.description}`);
          }
        }
        lines.push('');
      }
    }

    if (verificationResources.length > 0) {
      lines.push('## 2. Tests Requiring Review (Verification Impact)');
      lines.push('The following test suites cover the affected areas (note: this indicates verification scope, not that tests will fail):');
      for (const t of verificationResources) {
        lines.push(`- \`${t.affectedResourceId}\` (Score: ${t.score}/100, Confidence: \`${t.confidence}\`)`);
      }
      lines.push('');
    }

    if (paths.length > 0) {
      lines.push('## 3. Propagation Paths');
      for (const p of paths.slice(0, 5)) {
        lines.push(this.explainImpactPath(p));
        lines.push('');
      }
    }

    const output = lines.join('\n');
    return SecuritySanitizer.redactSecrets(output);
  }

  public explainFeatureImpact(
    impact: FeatureImpact,
    paths?: ImpactPath[],
    relatedTests?: ResourceImpact[]
  ): string {
    const lines: string[] = [
      `## Feature Impact: ${impact.targetFeatureId}`,
      `- **Impact Type**: \`${impact.impactType}\``,
      `- **Direct**: ${impact.direct ? 'Yes' : 'No'} (Distance: ${impact.distance})`,
      `- **Severity**: \`${impact.severity}\` (Score: ${impact.score}/100)`,
      `- **Confidence**: \`${impact.confidence}\``,
      `- **Criticality**: \`${impact.criticality}\``,
      '',
      '### Evidence:',
    ];

    for (const ev of impact.evidence) {
      lines.push(`- [${ev.source}] ${ev.description} (Confidence: ${Math.round(ev.confidence * 100)}%)`);
    }

    if (paths && paths.length > 0) {
      lines.push('');
      lines.push('### Causal Propagation Paths:');
      for (const p of paths) {
        const chain = p.nodes.map((n) => n.featureId || n.resourceId).join(' → ');
        lines.push(`- \`${chain}\` (Distance: ${p.distance}, Type: \`${p.pathType}\`)`);
      }
    }

    if (relatedTests && relatedTests.length > 0) {
      lines.push('');
      lines.push('### Verification Tests:');
      for (const t of relatedTests) {
        lines.push(`- \`${t.affectedResourceId}\``);
      }
    }

    return SecuritySanitizer.redactSecrets(lines.join('\n'));
  }

  public explainWhyAffected(
    targetFeatureId: string,
    featureImpacts: FeatureImpact[],
    paths: ImpactPath[]
  ): string {
    const impact = featureImpacts.find((f) => f.targetFeatureId === targetFeatureId);
    if (!impact) {
      return `Feature "${targetFeatureId}" is not currently identified as affected by the analyzed changes.`;
    }

    const lines: string[] = [
      `### Why is "${targetFeatureId}" affected?`,
      '',
      `"${targetFeatureId}" is ${impact.direct ? 'directly' : 'indirectly'} affected (Score: ${impact.score}/100, Severity: ${impact.severity}).`,
      '',
      '**Observable reasons:**',
    ];

    let index = 1;
    for (const ev of impact.evidence) {
      lines.push(`${index++}. ${ev.description}`);
    }

    const matchingPaths = paths.filter((p) => p.targetNode.featureId === targetFeatureId);
    if (matchingPaths.length > 0) {
      lines.push('');
      lines.push('**Propagation Path:**');
      for (const p of matchingPaths) {
        const chain = p.nodes.map((n) => n.featureId || n.resourceId).join(' → ');
        lines.push(`- \`${chain}\``);
      }
    }

    return SecuritySanitizer.redactSecrets(lines.join('\n'));
  }

  public explainImpactPath(path: ImpactPath): string {
    const chain = path.nodes.map((n) => n.featureId || n.resourceId).join(' → ');
    return `Path \`${path.pathId}\`: \`${chain}\` (Distance: ${path.distance}, Type: \`${path.pathType}\`, Confidence: \`${path.confidence}\`)`;
  }
}
