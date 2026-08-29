import { IRegistryStore, RepositoryRecord } from '../../../src/workspace/interfaces/storage/IRegistryStore';
import { StorageError } from '../../../src/workspace/errors';

export class InMemoryRegistryStore implements IRegistryStore {
  private records = new Map<string, RepositoryRecord>();

  async connect(path: string): Promise<void> {}

  async insertRepository(repo: RepositoryRecord): Promise<void> {
    this.records.set(repo.id, repo);
  }

  async getRepositoryByPath(path: string): Promise<RepositoryRecord | null> {
    for (const repo of this.records.values()) {
      if (repo.path === path) return repo;
    }
    return null;
  }

  async getRepositoryById(id: string): Promise<RepositoryRecord | null> {
    return this.records.get(id) || null;
  }

  async listAll(): Promise<RepositoryRecord[]> {
    return Array.from(this.records.values());
  }

  async close(): Promise<void> {}
}
