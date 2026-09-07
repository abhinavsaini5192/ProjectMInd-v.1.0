import type { Feature } from '../../models/Feature';
import type { FeatureRelationship } from '../models/FeatureRelationship';
import type { FeatureRelationshipEvidence } from '../models/FeatureRelationshipEvidence';

export interface StructuredRelationshipExplanation {
  relationshipId: string;
  source: { id: string; name?: string };
  target: { id: string; name?: string };
  relationshipType: string;
  direction: string;
  confidence: {
    level: string;
    score: number;
    reasons: string[];
  };
  summary: string;
  evidenceBySource: Record<
    string,
    {
      count: number;
      items: Array<{
        description: string;
        location?: string;
        strength: string | number;
        confidence: number;
      }>;
    }
  >;
  riskFactors: string[];
  narrative: string;
}

export class FeatureDependencyExplainer {
  public explainRelationship(
    relationship: FeatureRelationship,
    sourceFeature?: Feature,
    targetFeature?: Feature
  ): StructuredRelationshipExplanation {
    const sourceName = sourceFeature?.name || relationship.sourceFeatureId;
    const targetName = targetFeature?.name || relationship.targetFeatureId;

    // Group evidence by source type
    const evidenceBySource: StructuredRelationshipExplanation['evidenceBySource'] = {};
    for (const ev of relationship.evidence || []) {
      let group = evidenceBySource[ev.sourceType];
      if (!group) {
        group = { count: 0, items: [] };
        evidenceBySource[ev.sourceType] = group;
      }
      group.count++;
      const loc = (ev.metadata?.location as string | undefined) || (ev.metadata?.filePath as string | undefined) || ev.sourceId;
      group.items.push({
        description: ev.description,
        location: loc,
        strength: ev.strength,
        confidence: ev.confidence,
      });
    }

    // Risk factors
    const riskFactors: string[] = [];
    if (relationship.score < 0.4) {
      riskFactors.push('Low confidence score: relationship is supported by weak or circumstantial signals.');
    }
    if (relationship.relationshipType === 'SHARES_DATA') {
      riskFactors.push('Shared data store: cross-feature database coupling may lead to hidden schema dependencies.');
    }
    if (relationship.relationshipType === 'SHARES_RESOURCE') {
      riskFactors.push('Shared technical resource: changes to shared utility/file could inadvertently impact both features.');
    }
    if (relationship.relationshipType === 'ASSOCIATED_WITH') {
      riskFactors.push('Co-change coupling: historical correlation does not guarantee direct code invocations.');
    }

    // High level summary
    const sourceTypes = Object.keys(evidenceBySource);
    const summary = `${sourceName} ${relationship.relationshipType.toLowerCase().replace(/_/g, ' ')} ${targetName} (Confidence: ${relationship.confidence.level}, Score: ${relationship.score}). Supported by ${relationship.evidence.length} evidence point(s) across ${sourceTypes.length} signal source(s).`;

    // Markdown narrative
    const lines: string[] = [
      `### Relationship Explanation: ${sourceName} → ${targetName}`,
      ``,
      `**Type**: \`${relationship.relationshipType}\` (${relationship.direction})`,
      `**Confidence**: ${relationship.confidence.level} (${relationship.score.toFixed(2)})`,
      `**Origin**: ${relationship.source}`,
      ``,
      `#### Summary`,
      summary,
      ``,
      `#### Evidence Breakdown`,
    ];

    for (const [srcType, data] of Object.entries(evidenceBySource)) {
      lines.push(`- **${srcType}** (${data.count} items):`);
      for (const item of data.items) {
        const loc = item.location ? ` in \`${item.location}\`` : '';
        lines.push(`  - ${item.description}${loc} (confidence: ${item.confidence.toFixed(2)})`);
      }
    }

    if (riskFactors.length > 0) {
      lines.push(``);
      lines.push(`#### Potential Risks / Observations`);
      for (const risk of riskFactors) {
        lines.push(`- ⚠️ ${risk}`);
      }
    }

    return {
      relationshipId: relationship.relationshipId,
      source: { id: relationship.sourceFeatureId, name: sourceName },
      target: { id: relationship.targetFeatureId, name: targetName },
      relationshipType: relationship.relationshipType,
      direction: relationship.direction,
      confidence: relationship.confidence,
      summary,
      evidenceBySource,
      riskFactors,
      narrative: lines.join('\n'),
    };
  }
}
