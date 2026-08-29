import { AgentSession } from '../models/AgentSession';
import { Feedback } from '../models/Feedback';

export class ContextEvaluator {
  public evaluate(providedContextIds: string[], session: AgentSession, feedback?: Feedback) {
    const useful: string[] = [];
    const unused: string[] = [];
    const misleading: string[] = [];

    if (feedback && feedback.irrelevantEntities) {
       unused.push(...feedback.irrelevantEntities);
    }
    if (feedback && feedback.rating === 'MISLEADING_CONTEXT') {
       misleading.push(...providedContextIds); // Blunt fallback
    }

    for (const ctx of providedContextIds) {
       // Mock logic: if it's not marked unused/misleading explicitly, check if agent modified it
       // Ideally we'd check if the agent *read* it, but modified is a strong proxy for useful
       if (!unused.includes(ctx) && !misleading.includes(ctx)) {
          // If we had read-traces, we'd use them. Assume useful for now unless proven unused.
          useful.push(ctx);
       }
    }

    return { useful, unused, misleading };
  }
}
