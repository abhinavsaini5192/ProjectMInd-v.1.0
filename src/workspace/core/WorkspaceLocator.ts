import { WorkspaceRegistry } from './WorkspaceRegistry';
import { WorkspacePathResolver } from './WorkspacePathResolver';
import { IWorkspaceStore } from '../interfaces/storage/IWorkspaceStore';
import { WorkspaceNotFoundError } from '../errors';
import path from 'path';

export class WorkspaceLocator {
  constructor(
    private registry: WorkspaceRegistry,
    private pathResolver: WorkspacePathResolver,
    private workspaceStore: IWorkspaceStore
  ) {}

  async locateByRepositoryId(id: string): Promise<string> {
    const repo = await this.registry.getRepository(id);
    if (!repo) {
      throw new WorkspaceNotFoundError(`Repository ID ${id} not found in registry.`);
    }

    const workspacePath = this.pathResolver.resolveWorkspacePath(id);
    const exists = await this.workspaceStore.pathExists(workspacePath);
    if (!exists) {
      throw new WorkspaceNotFoundError(`Workspace path ${workspacePath} does not exist for ID ${id}.`);
    }

    return workspacePath;
  }

  async locateByLocalPath(localPath: string): Promise<string> {
    const pointerPath = path.join(localPath, '.projectmind.json');
    const exists = await this.workspaceStore.pathExists(pointerPath);
    if (!exists) {
      throw new WorkspaceNotFoundError(`Pointer file not found at ${pointerPath}`);
    }

    const pointer = await this.workspaceStore.readJson<{ repositoryId: string }>(pointerPath);
    if (!pointer || !pointer.repositoryId) {
      throw new WorkspaceNotFoundError(`Invalid pointer file at ${pointerPath}`);
    }

    return this.locateByRepositoryId(pointer.repositoryId);
  }
}

export const IWorkspaceLocatorToken = Symbol('WorkspaceLocator');
