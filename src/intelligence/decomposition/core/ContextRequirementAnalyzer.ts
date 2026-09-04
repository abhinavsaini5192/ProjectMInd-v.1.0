import { Subtask } from '../models/Subtask';
import { ContextRequirement } from '../models/ContextRequirement';
import { InformationGap } from '../models/InformationGap';

export class ContextRequirementAnalyzer {
  public analyzeRequirements(subtask: Subtask, knownSymbols: string[] = []): {
    requirements: ContextRequirement[];
    informationGaps: InformationGap[];
  } {
    const requirements: ContextRequirement[] = [];
    const informationGaps: InformationGap[] = [];

    for (const hint of subtask.requiredContext) {
      requirements.push({
        requirementId: `req_${subtask.subtaskId}_${hint}`,
        subtaskId: subtask.subtaskId,
        description: `Required context for ${hint} in subtask ${subtask.title}`,
        resourceTypes: ['SYMBOL', 'FILE', 'CONFIGURATION', 'TEST'],
        targetKeywords: [hint, subtask.title],
        priority: 'HIGH',
        mandatory: true
      });

      // If required symbol is completely absent from known state, record an information gap
      if (knownSymbols.length > 0 && !knownSymbols.includes(hint)) {
        informationGaps.push({
          gapId: `gap_${subtask.subtaskId}_${hint}`,
          subtaskId: subtask.subtaskId,
          description: `Unknown location/implementation of ${hint}`,
          severity: 'HIGH',
          blocking: true,
          confidence: 0.9,
          requiredEvidence: `Symbol or file definition for ${hint}`,
          resolved: false
        });
      }
    }

    return { requirements, informationGaps };
  }
}
