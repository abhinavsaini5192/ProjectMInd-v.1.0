import { IRegistryStore, RepositoryRecord } from '../interfaces/storage/IRegistryStore';
import { ILogger } from '../interfaces/ILogger';
import { RegistryError } from '../errors';

export class WorkspaceRegistry {
  constructor(
    private registryStore: IRegistryStore,
    private logger: ILogger
  ) {}

  async registerRepository(repo: RepositoryRecord): Promise<void> {
    try {
      const existing = await this.registryStore.getRepositoryById(repo.id);
      if (existing) {
        throw new RegistryError(`Repository with ID ${repo.id} is already registered.`);
      }
      await this.registryStore.insertRepository(repo);
      this.logger.info({ component: 'WorkspaceRegistry', operation: 'registerRepository', repositoryId: repo.id, message: 'Registered new repository', severity: 'INFO' });
    } catch (err: any) {
      if (err instanceof RegistryError) throw err;
      throw new RegistryError(`Failed to register repository: ${err.message}`);
    }
  }

  async getRepository(id: string): Promise<RepositoryRecord | null> {
    return this.registryStore.getRepositoryById(id);
  }

  async getRepositoryByPath(path: string): Promise<RepositoryRecord | null> {
    return this.registryStore.getRepositoryByPath(path);
  }

  async listRepositories(): Promise<RepositoryRecord[]> {
    return this.registryStore.listAll();
  }
}

export const IWorkspaceRegistryToken = Symbol('WorkspaceRegistry');
