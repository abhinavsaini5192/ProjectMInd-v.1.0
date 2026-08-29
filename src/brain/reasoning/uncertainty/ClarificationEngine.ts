import { KnowledgeGap } from '../models/KnowledgeGap';
import { ClarificationRequest } from '../models/ClarificationRequest';
import crypto from 'crypto';

export class ClarificationEngine {
  public generate(gaps: KnowledgeGap[]): ClarificationRequest | undefined {
    if (gaps.length === 0) return undefined;

    // Rank gaps by criticality. High = 1.0, Medium = 0.6, Low = 0.2
    const sortedGaps = [...gaps].sort((a, b) => {
       const wA = a.criticality === 'HIGH' ? 1.0 : (a.criticality === 'MEDIUM' ? 0.6 : 0.2);
       const wB = b.criticality === 'HIGH' ? 1.0 : (b.criticality === 'MEDIUM' ? 0.6 : 0.2);
       return wB - wA;
    });

    const primaryGap = sortedGaps[0];

    // Minimal explicit clarification
    return {
      id: crypto.randomUUID(),
      question: `Clarification needed: ${primaryGap.description} How would you like to proceed?`,
      expectedInformationGain: 0.9,
      userEffort: 0.2, // Quick answer
      valueScore: 0.9 / 0.2 // 4.5
    };
  }
}
