import { ContextPack } from '../../context/models/ContextPack';
import { Evidence } from '../models/Evidence';
import crypto from 'crypto';

export class EvidenceEngine {
  public extractEvidence(task: string, pack: ContextPack): Evidence[] {
    const evidence: Evidence[] = [];

    // Rule: Explicit mention in task gives strong evidence
    const lowerTask = task.toLowerCase();

    for (const ctx of pack.sections.required) {
      if (ctx.type === 'FEATURE' && lowerTask.includes(ctx.id.replace('feat_', ''))) {
         evidence.push({
           id: crypto.randomUUID(),
           type: 'TASK_MENTION',
           sourceId: ctx.id,
           description: `Task explicitly mentions feature ${ctx.id}`,
           confidenceContribution: 0.4
         });
      }

      evidence.push({
         id: crypto.randomUUID(),
         type: 'FEATURE_MATCH',
         sourceId: ctx.id,
         description: `Context Planner identified ${ctx.id} as highly relevant`,
         confidenceContribution: 0.3
      });
    }

    return evidence;
  }
}
