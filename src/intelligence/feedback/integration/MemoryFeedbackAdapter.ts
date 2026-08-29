import { LearningCandidate } from '../models/LearningCandidate';
import { MemoryType } from '../../../agent/memory/models/MemoryType';
import { MemorySource } from '../../../agent/memory/models/MemorySource';

export class MemoryFeedbackAdapter {
  private memoryStore: any[] = [];

  constructor(private memoryEngine?: any) {}

  public async persistLearning(candidate: LearningCandidate): Promise<{ memoryId: string; content: string; type: string }> {
    const memoryId = `mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const record = {
      memoryId,
      content: candidate.content,
      type: this.mapCategoryToMemoryType(candidate.category),
      source: {
        sourceType: MemorySource.TASK_EXECUTION,
        sourceId: candidate.source
      },
      confidence: candidate.confidenceScore
    };

    if (this.memoryEngine?.promoteCandidate) {
      await this.memoryEngine.promoteCandidate({
        type: record.type,
        content: candidate.content,
        confidence: candidate.confidenceScore,
        importance: 0.8,
        source: record.source,
        evidence: candidate.evidence.map(e => ({
          evidenceId: e.evidenceId,
          type: e.sourceType,
          description: e.description,
          confidence: e.confidence,
          timestamp: e.timestamp
        }))
      });
    }

    this.memoryStore.push(record);
    return record;
  }

  public getStoredMemories(): any[] {
    return [...this.memoryStore];
  }

  private mapCategoryToMemoryType(category: string): MemoryType {
    if (category === 'PROJECT_CONVENTION') return MemoryType.SEMANTIC;
    if (category === 'WORKFLOW_PATTERN' || category === 'SUCCESS_PATTERN') return MemoryType.PROCEDURAL;
    return MemoryType.EPISODIC;
  }
}
