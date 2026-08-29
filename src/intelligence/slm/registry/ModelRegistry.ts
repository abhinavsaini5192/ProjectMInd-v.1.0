import { ModelRecord } from './ModelRecord';
import { ModelAvailability } from './ModelAvailability';

export class ModelRegistry {
  private models: Map<string, ModelRecord> = new Map();

  public registerModel(record: ModelRecord): void {
    this.models.set(record.modelId, record);
  }

  public updateModel(modelId: string, updates: Partial<ModelRecord>): void {
    const existing = this.models.get(modelId);
    if (existing) {
      this.models.set(modelId, { ...existing, ...updates, lastSeen: Date.now() });
    }
  }

  public removeModel(modelId: string): void {
    this.models.delete(modelId);
  }

  public getModel(modelId: string): ModelRecord | undefined {
    return this.models.get(modelId);
  }

  public listModels(): ModelRecord[] {
    return Array.from(this.models.values());
  }

  public findAvailableModels(): ModelRecord[] {
    return this.listModels().filter(m => m.availability === ModelAvailability.AVAILABLE);
  }

  public invalidateStaleRecords(thresholdMs: number = 300000): void {
    const now = Date.now();
    for (const [id, model] of this.models.entries()) {
      if (now - model.lastSeen > thresholdMs) {
        model.availability = ModelAvailability.UNAVAILABLE;
      }
    }
  }
}
