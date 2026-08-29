import { WorkspaceRegistry } from '../core/WorkspaceRegistry';
import { RepositoryRecord } from '../interfaces/storage/IRegistryStore';

export class RegistryService {
  constructor(private registry: WorkspaceRegistry) {}

  async register(repo: RepositoryRecord): Promise<void> {
    await this.registry.registerRepository(repo);
  }

  async getRepository(id: string): Promise<RepositoryRecord | null> {
    return this.registry.getRepository(id);
  }

  async listAll(): Promise<RepositoryRecord[]> {
    return this.registry.listRepositories();
  }
}

export const IRegistryServiceToken = Symbol('RegistryService');
