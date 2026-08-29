import { IQuery, IQueryResult } from '../models/IQueryResult';
import crypto from 'crypto';

export class QueryCache {
  private cache: Map<string, IQueryResult> = new Map();

  public generateKey(query: IQuery, knowledgeVersion: string): string {
    const payload = `${query.repositoryId || ''}:${query.entity}:${query.operation}:${JSON.stringify(query.filters)}:${(query.include || []).join(',')}:${query.snapshotId || 'latest'}:${knowledgeVersion}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  public get(key: string): IQueryResult | undefined {
    return this.cache.get(key);
  }

  public set(key: string, result: IQueryResult): void {
    this.cache.set(key, result);
  }

  public invalidateAll(): void {
    this.cache.clear();
  }

  public invalidateEntity(entity: string): void {
    // Advanced invalidation would track reverse-keys. For now we clear everything.
    // Real implementation would only flush keys containing this entity.
    this.cache.clear(); 
  }
}
