import { Hypothesis } from '../models/Hypothesis';
import { Evidence } from '../models/Evidence';
import crypto from 'crypto';

export class HypothesisEngine {
  public generateHypotheses(task: string, evidenceList: Evidence[]): Hypothesis[] {
    const hypotheses: Hypothesis[] = [];

    // Mock logic for ambiguity
    if (task.toLowerCase().includes('ambiguous') || task.toLowerCase().includes('or')) {
       hypotheses.push({
         id: crypto.randomUUID(),
         description: 'Interpretation A (Primary)',
         evidence: evidenceList.slice(0, Math.ceil(evidenceList.length / 2)),
         confidence: 0,
         status: 'ACTIVE'
       });
       hypotheses.push({
         id: crypto.randomUUID(),
         description: 'Interpretation B (Alternative)',
         evidence: evidenceList.slice(Math.ceil(evidenceList.length / 2)),
         confidence: 0,
         status: 'ACTIVE'
       });
    } else {
       hypotheses.push({
         id: crypto.randomUUID(),
         description: 'Direct task execution path',
         evidence: [...evidenceList],
         confidence: 0,
         status: 'ACTIVE'
       });
    }

    return hypotheses;
  }
}
