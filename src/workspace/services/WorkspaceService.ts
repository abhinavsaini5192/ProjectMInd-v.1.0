import { WorkspaceManager } from '../core/WorkspaceManager';
import { WorkspaceLocator } from '../core/WorkspaceLocator';

export class WorkspaceService {
  constructor(
    private manager: WorkspaceManager,
    private locator: WorkspaceLocator
  ) {}

  async initialize(repositoryId: string, repositoryPath: string): Promise<void> {
    await this.manager.initializeWorkspace(repositoryId, repositoryPath);
  }

  async load(repositoryId: string): Promise<void> {
    await this.manager.loadWorkspace(repositoryId);
  }

  async locateByPath(localPath: string): Promise<string> {
    return this.locator.locateByLocalPath(localPath);
  }
}

export const IWorkspaceServiceToken = Symbol('WorkspaceService');
