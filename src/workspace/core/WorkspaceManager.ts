import { WorkspaceRegistry } from './WorkspaceRegistry';
import { WorkspaceLocator } from './WorkspaceLocator';
import { WorkspaceLifecycleManager } from './WorkspaceLifecycleManager';
import { WorkspaceHealthMonitor } from '../health/WorkspaceHealthMonitor';
import { WorkspacePathResolver } from './WorkspacePathResolver';
import { ILogger } from '../interfaces/ILogger';
import { IEventBus } from '../interfaces/IEventBus';
import { WorkspaceEvents } from '../types/WorkspaceEvents';
import { IWorkspaceStore } from '../interfaces/storage/IWorkspaceStore';
import { WorkspaceStatus } from '../models/WorkspaceStatus';
import path from 'path';

export class WorkspaceManager {
  constructor(
    private registry: WorkspaceRegistry,
    private locator: WorkspaceLocator,
    private lifecycle: WorkspaceLifecycleManager,
    private healthMonitor: WorkspaceHealthMonitor,
    private pathResolver: WorkspacePathResolver,
    private workspaceStore: IWorkspaceStore,
    private eventBus: IEventBus,
    private logger: ILogger
  ) {}

  async initializeWorkspace(repositoryId: string, repositoryPath: string): Promise<void> {
    this.logger.info({ component: 'WorkspaceManager', operation: 'initializeWorkspace', repositoryId, message: 'Initializing workspace', severity: 'INFO' });
    
    // 1. Create global directories
    const globalPath = this.pathResolver.resolveGlobalWorkspacePath();
    await this.workspaceStore.ensureDirectory(path.join(globalPath, 'registry'));
    await this.workspaceStore.ensureDirectory(path.join(globalPath, 'config'));
    await this.workspaceStore.ensureDirectory(path.join(globalPath, 'plugins'));
    await this.workspaceStore.ensureDirectory(path.join(globalPath, 'models'));
    await this.workspaceStore.ensureDirectory(path.join(globalPath, 'workspaces'));

    // 2. Create repo directories
    const workspacePath = this.pathResolver.resolveWorkspacePath(repositoryId);
    await this.workspaceStore.ensureDirectory(workspacePath);
    await this.workspaceStore.ensureDirectory(path.join(workspacePath, 'state'));
    await this.workspaceStore.ensureDirectory(path.join(workspacePath, 'intelligence'));
    await this.workspaceStore.ensureDirectory(path.join(workspacePath, 'context'));
    await this.workspaceStore.ensureDirectory(path.join(workspacePath, 'databases'));

    // 3. Register
    await this.registry.registerRepository({
      id: repositoryId,
      path: repositoryPath,
      createdAt: new Date().toISOString(),
      status: WorkspaceStatus.Initializing
    });

    // 4. Create pointer
    await this.workspaceStore.writeJson(path.join(repositoryPath, '.projectmind.json'), {
      repositoryId,
      workspaceVersion: '2.0',
      createdAt: new Date().toISOString(),
      workspaceType: 'global'
    });

    this.lifecycle.transition(repositoryId, WorkspaceStatus.Uninitialized, WorkspaceStatus.Initializing);
    this.lifecycle.transition(repositoryId, WorkspaceStatus.Initializing, WorkspaceStatus.Ready);

    this.eventBus.publish(WorkspaceEvents.WorkspaceCreated, { repositoryId });
    this.logger.info({ component: 'WorkspaceManager', operation: 'initializeWorkspace', repositoryId, message: 'Workspace initialized successfully', severity: 'INFO' });
  }

  async loadWorkspace(repositoryId: string): Promise<void> {
    const wsPath = await this.locator.locateByRepositoryId(repositoryId);
    this.logger.info({ component: 'WorkspaceManager', operation: 'loadWorkspace', repositoryId, message: `Loaded workspace at ${wsPath}`, severity: 'INFO' });
    
    const health = await this.healthMonitor.runDiagnostics(repositoryId);
    if (health.status === 'corrupted') {
      this.logger.warn({ component: 'WorkspaceManager', operation: 'loadWorkspace', repositoryId, message: 'Workspace corrupted', severity: 'WARN' });
      this.lifecycle.transition(repositoryId, WorkspaceStatus.Ready, WorkspaceStatus.Repairing);
    }
    
    this.eventBus.publish(WorkspaceEvents.WorkspaceLoaded, { repositoryId, path: wsPath, health });
  }
}

export const IWorkspaceManagerToken = Symbol('WorkspaceManager');
