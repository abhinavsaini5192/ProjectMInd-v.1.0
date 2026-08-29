import { Memory } from '../models/Memory';

export interface IMemoryStore {
  save(memory: Memory): Promise<void>;
  update(memory: Memory): Promise<void>;
  findById(memoryId: string): Promise<Memory | null>;
  findSimilar(content: string, type: string): Promise<Memory[]>;
  findBySymbol(symbol: string): Promise<Memory[]>;
  findByFeature(feature: string): Promise<Memory[]>;
  findByTask(taskId: string): Promise<Memory[]>;
  findAllActive(): Promise<Memory[]>;
}
