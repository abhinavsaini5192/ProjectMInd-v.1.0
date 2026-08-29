export class MemoryAdapter {
  constructor(private memoryEngine?: any) {}

  public async recordTaskOutcome(taskId: string, outcome: string): Promise<void> {
    if (this.memoryEngine?.recordMemory) {
      await this.memoryEngine.recordMemory({
        taskId,
        outcome,
        timestamp: Date.now()
      });
    }
  }
}
