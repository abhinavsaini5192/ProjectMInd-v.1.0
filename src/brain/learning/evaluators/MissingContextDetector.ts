import { AgentSession } from '../models/AgentSession';
import { Feedback } from '../models/Feedback';

export class MissingContextDetector {
  public detect(providedContextIds: string[], session: AgentSession, feedback?: Feedback): string[] {
    const missing: string[] = [];
    
    // Explicit human feedback
    if (feedback && feedback.missingEntities) {
       missing.push(...feedback.missingEntities);
    }

    // Implicit missing context: Agent modified a file not in the context pack
    for (const file of session.changedFiles) {
       // Simple mock: if file isn't substring-matched in provided context IDs
       const wasProvided = providedContextIds.some(id => id.includes(file));
       if (!wasProvided) {
          missing.push(`file_${file}`);
       }
    }

    return [...new Set(missing)];
  }
}
