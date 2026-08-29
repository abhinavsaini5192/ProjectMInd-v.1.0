import { ContextPack, ContextMode } from '../models/ContextPack';

export class ContextCache {
  private cache: Map<string, ContextPack> = new Map();

  public generateKey(repositoryId: string, task: string, mode: ContextMode): string {
    return `${repositoryId}:${task}:${mode}`;
  }

  public get(key: string): ContextPack | undefined {
    return this.cache.get(key);
  }

  public set(key: string, pack: ContextPack): void {
    this.cache.set(key, pack);
  }

  public invalidate(repositoryId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${repositoryId}:`)) {
        this.cache.delete(key);
      }
    }
  }
}
