import { LoopOutcome } from '../models/LoopOutcome';

export interface EpisodicMemoryEntry {
  memoryId: string;
  taskId: string;
  success: boolean;
  summary: string;
  lessonsLearned: string[];
  createdAt: number;
}

export class MemoryFeedbackBridge {
  private memoryStore: EpisodicMemoryEntry[] = [];

  public async recordOutcome(outcome: LoopOutcome): Promise<void> {
    const memoryId = `mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const lessons: string[] = [];

    if (outcome.verificationPassed) {
      lessons.push(`Successful resolution for task "${outcome.taskId}" in ${outcome.iterations.length} iterations.`);
    } else {
      lessons.push(`Task "${outcome.taskId}" failed or was halted: ${outcome.errors.join(', ')}`);
    }

    this.memoryStore.push({
      memoryId,
      taskId: outcome.taskId,
      success: outcome.verificationPassed,
      summary: outcome.finalDecisionSummary || 'Task execution record',
      lessonsLearned: lessons,
      createdAt: Date.now()
    });
  }

  public getMemories(): EpisodicMemoryEntry[] {
    return [...this.memoryStore];
  }
}
