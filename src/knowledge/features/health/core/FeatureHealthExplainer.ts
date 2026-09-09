import { SecuritySanitizer } from '../../../../intelligence/agent/hardening/SecuritySanitizer.js';
import type { IFeatureHealthExplainer } from '../interfaces/IFeatureHealthExplainer.js';
import type { FeatureHealth } from '../models/FeatureHealth.js';
import type { FeatureRisk } from '../models/FeatureRisk.js';
import type { FeatureCriticality } from '../models/FeatureCriticality.js';
import { FEATURE_HEALTH_DIMENSIONS } from '../models/FeatureHealthDimension.js';

export class FeatureHealthExplainer implements IFeatureHealthExplainer {
  public explainHealth(health: FeatureHealth): string {
    const lines: string[] = [];
    const score = health.healthScore;
    const risk = health.riskAssessment;

    lines.push(`# Feature Health Report: ${health.featureId}`);
    lines.push('');
    lines.push(`**Overall Health Score:** \`${score.overallScore}/100\` | **Status:** **${score.status}** | **Confidence:** \`${(score.confidence * 100).toFixed(0)}%\``);
    lines.push(`**Overall Risk Score:** \`${risk.overallRiskScore}/100\` | **Highest Risk Severity:** **${risk.highestRiskSeverity}**`);
    lines.push(`**Criticality:** **${health.criticality.level}** (\`${health.criticality.score}/100\`) | **Stability:** **${health.stability.level}** (\`${health.stability.score}/100\`) | **Verification:** **${health.verificationQuality.level}** (\`${health.verificationQuality.score}/100\`)`);
    lines.push('');

    // Dimensions Table
    lines.push('## Health Dimension Breakdown');
    lines.push('');
    lines.push('| Dimension | Score | Weight | Signal Count | Confidence |');
    lines.push('| :--- | :---: | :---: | :---: | :---: |');

    for (const dim of FEATURE_HEALTH_DIMENSIONS) {
      const res = score.dimensionScores[dim];
      lines.push(`| **${dim}** | \`${res.score}/100\` | ${(res.weight * 100).toFixed(0)}% | ${res.signalCount} | ${(res.confidence * 100).toFixed(0)}% |`);
    }
    lines.push('');

    // Active Risks
    lines.push(`## Active Risks (${risk.risks.length})`);
    lines.push('');
    if (risk.risks.length === 0) {
      lines.push('*No active risks detected for this feature.*');
    } else {
      for (const r of risk.risks) {
        lines.push(`### [${r.severity}] ${r.riskType} (Score: \`${r.score}/100\`)`);
        lines.push(r.description);
        lines.push('');
        if (r.affectedResources.length > 0) {
          lines.push(`- **Affected Resources:** ${r.affectedResources.map((res) => `\`${res}\``).join(', ')}`);
        }
        if (r.evidence.length > 0) {
          lines.push(`- **Evidence:**`);
          for (const evi of r.evidence.slice(0, 3)) {
            lines.push(`  - *[${evi.evidenceType}]* ${evi.description}`);
          }
        }
        lines.push('');
      }
    }

    // Recommendations
    lines.push(`## Actionable Recommendations (${health.recommendations.length})`);
    lines.push('');
    if (health.recommendations.length === 0) {
      lines.push('*No remediation actions currently required.*');
    } else {
      for (const rec of health.recommendations) {
        lines.push(`### [${rec.priority}] ${rec.title}`);
        lines.push(`*Category:* \`${rec.category}\``);
        lines.push('');
        lines.push(rec.description);
        lines.push('');
        if (rec.actionableSteps.length > 0) {
          lines.push('**Action Steps:**');
          for (const step of rec.actionableSteps) {
            lines.push(`1. ${step}`);
          }
          lines.push('');
        }
      }
    }

    return SecuritySanitizer.redactSecrets(lines.join('\n'));
  }

  public explainRisk(risk: FeatureRisk): string {
    const lines: string[] = [];
    lines.push(`### Risk [${risk.severity}] ${risk.riskType}: Feature ${risk.featureId}`);
    lines.push(`- **Risk Score:** \`${risk.score}/100\` (Confidence: \`${(risk.confidence * 100).toFixed(0)}%\`)`);
    lines.push(`- **Description:** ${risk.description}`);
    if (risk.affectedResources.length > 0) {
      lines.push(`- **Affected Resources:** ${risk.affectedResources.join(', ')}`);
    }
    if (risk.evidence.length > 0) {
      lines.push(`- **Key Evidence Items:**`);
      for (const evi of risk.evidence) {
        lines.push(`  - ${evi.evidenceType}: ${evi.description}`);
      }
    }
    return SecuritySanitizer.redactSecrets(lines.join('\n'));
  }

  public explainCriticality(criticality: FeatureCriticality): string {
    const lines: string[] = [];
    lines.push(`### Feature Criticality: ${criticality.level} (${criticality.score}/100)`);
    lines.push(`- **Inbound Dependents:** ${criticality.metrics.dependentCount}`);
    lines.push(`- **Exposed Endpoints:** ${criticality.metrics.endpointCount}`);
    lines.push(`- **Exported Symbols:** ${criticality.metrics.exportCount}`);
    lines.push(`- **Core Domain Feature:** ${criticality.metrics.coreDomain ? 'Yes' : 'No'}`);
    return SecuritySanitizer.redactSecrets(lines.join('\n'));
  }
}
