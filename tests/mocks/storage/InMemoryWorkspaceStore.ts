import { IWorkspaceStore } from '../../../src/workspace/interfaces/storage/IWorkspaceStore';
import { StorageError } from '../../../src/workspace/errors';

export class InMemoryWorkspaceStore implements IWorkspaceStore {
  private memoryFs = new Map<string, string>();
  private directories = new Set<string>();

  async ensureDirectory(path: string): Promise<void> {
    this.directories.add(path);
  }

  async writeJson<T>(path: string, data: T): Promise<void> {
    this.memoryFs.set(path, JSON.stringify(data));
  }

  async readJson<T>(path: string): Promise<T> {
    const data = this.memoryFs.get(path);
    if (!data) throw new StorageError(`File not found: ${path}`);
    return JSON.parse(data) as T;
  }

  async writeText(path: string, data: string): Promise<void> {
    this.memoryFs.set(path, data);
  }

  async readText(path: string): Promise<string> {
    const data = this.memoryFs.get(path);
    if (!data) throw new StorageError(`File not found: ${path}`);
    return data;
  }

  async pathExists(path: string): Promise<boolean> {
    return this.memoryFs.has(path) || this.directories.has(path);
  }
}
